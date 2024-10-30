$(document).ready(function() {
    // Load the environment dropdown options from config.json
    var envs = [];
    $.getJSON('./config.json', function(data) {
        envs = data.envs;
        var dropdown = $('#env');
        $.each(data.envs, function(index, env) {
            dropdown.append($('<option></option>').attr('value', env.name).text(env.name));
        });
    });

    $('#env').change(function() {
        var selectedValue = $(this).val();
        var baseSiteUrl = envs.find(env => env.name === selectedValue).baseSiteUrl;
        $('#baseSiteUrl').val(baseSiteUrl);
    });

    $('#loadSites').click(function() {
        // Send GET request to basesiteurl
        baseSiteUrl = $('#baseSiteUrl').val();

        if (baseSiteUrl !== '') {
            $.get(baseSiteUrl + '?fields=FULL', function(data) {
                var sitesList = $('#sites');
                sitesList.empty(); // Clear any existing list items

                sitesList.append($('<h4></h4>').text('click below link to get token, if you can not find your site, please check the CDCSiteConfig from backoffice make sure it is configured for the site'));

                $.each(data.baseSites, function(index, site) {
                    if (site.cdcSiteConfig) {
                        
                        var listItem = $('<li></li>');
                        var link = $('<a></a>').attr('href','').text(site.uid);
                        link.click(async function(event) {
                            event.preventDefault(); // Prevent default link behavior
                            var loginUrl = await getAuthUrl(site.cdcSiteConfig);
                            link.attr('href', loginUrl);
                            localStorage.setItem('cdcSiteConfig', JSON.stringify(site.cdcSiteConfig));
                            window.location.href = loginUrl; // Redirect to loginUrl
                        });
                        listItem.append(link);
                        sitesList.append(listItem);
                    }
                });
            }).fail(function() {
                alert('Failed to load sites. Please check the base site URL.');
            });
        }
    });
});


function generateCodeVerifier(length) {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let random = '';
    const values = crypto.getRandomValues(new Uint8Array(length));
    for (let i = 0; i < values.length; i++) {
    random += charset[values[i] % charset.length];
    }
    localStorage.setItem('codeVerifier', random);
    return random;
}


async function generateCodeChallenge(codeVerifier) {
    const encoder = new TextEncoder();
    const data = encoder.encode(codeVerifier);
    const hash = await crypto.subtle.digest('SHA-256', data);
    let base64 = btoa(String.fromCharCode(...new Uint8Array(hash)));
    base64 = base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
    localStorage.setItem('codeChallenge', base64);
    return base64;
}

async function getAuthUrl(cdcSiteConfig) {
    var authorizationEndpoint = cdcSiteConfig.oidcOpIssuerURI + "/authorize";
    var clientId = cdcSiteConfig.oidcRpClientId;
    var scopes = cdcSiteConfig.scopes.join("%20");
    var redirectUri =  window.location.protocol + "//" + window.location.host + "/callback.html";
    var codeVerifier = generateCodeVerifier(64);
    var codeChallenge = await generateCodeChallenge(codeVerifier);
    return `${authorizationEndpoint}?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&code_challenge=${codeChallenge}&code_challenge_method=S256&scope=${scopes}`;
}
