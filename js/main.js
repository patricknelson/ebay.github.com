(function () {
    var base_url = 'file:///Users/jbrittain/vc/ebay.github.com';
    var ebay_org_projects = { projects: [
        { org: 'ebay', repo: '*', ebayOrg: 'eBay Marketplaces' },
        { org: 'ebaysf', repo: '*', ebayOrg: 'eBay Marketplaces' },
        { org: 'ebayopensource', repo: '*', ebayOrg: 'eBay Marketplaces' },
        { org: 'raptorjs', repo: '*', ebayOrg: 'eBay Marketplaces' },
        { org: 'ql-io', repo: '*', ebayOrg: 'eBay Marketplaces' }
        /* Don't show non-Marketplaces orgs without their permission..
        { org: 'paypal', repo: '*', ebayOrg: 'PayPal' },
        { org: 'xcommerce', repo: '*', ebayOrg: 'X.commerce' },
        { org: 'magento', repo: '*', ebayOrg: 'Magento' }
        */
    ]};

    // ebay_contributed_projects: a list of isolated individual OSS projects
    // hosted in another org on github, where this list contains each project's
    // github org and repo names.
    var ebay_contributed_projects = { projects: [
        /*{ org: '', repo: '', ebayOrg: 'eBay Marketplaces' }*/
    ]};

    var github_api_url = 'https://api.github.com/';
    var item_tmpl = $('#repo-item').html();
    var total_repos_div = $('#total-repos');
    var repos_div = $('#repos');
    var forked_from_tmpl = $('#forked-from').html();
    var forked_html = '';
    var members_div = $('#members');
    var query = '';
    var repos = [];
    var repos_results = [];
    var total_members = 0;

    var my = {

        /*
        getRepoMembers: function(owner, name) {
            $.ajax({
                url: github_api_url + 'repos/' + owner + '/' + name
                     + '/collaborators',
                dataType: 'jsonp',
                success: function(resp) {
                    var members = resp.data;
                    if (members) {
                        members_div.html(members.length + " Members");
                    }
                },
                context: my
            });
        },
        */

        updateResults: function() {
            total_repos_div.html(repos_results.length);
            repos_div.html(Mustache.to_html(item_tmpl, {repos: repos_results}));
        },

        searchRegexpMatch: function(query) {
            //alert('searching for regexp matches: ' + query);
            for (var i = 0; i < repos_results.length; i++) {
                var re = new RegExp(query, 'i');
                if (repos_results[i].full_name.match(re) ||
                    repos_results[i].description.match(re)) {
                    continue;
                }

                repos_results.splice(i, 1);
                i--;
            }
        },

        searchRepos: function(query) {
            //alert('search: ' + query);
            // If it's an empty query string, set it to match everything.
            if (query == '') {
                query = '.*';
            }

            // Reset results to the full set by cloning the array, then filter.
            repos_results = repos.slice(0);
            
            this.searchRegexpMatch.call(this, query);
            this.updateResults.call(this);
        },

        formatDate: function(date_string) {
            var month_names = new Array("January", "February", "March", "April",
                "May", "June", "July", "August", "September", "October",
                "November", "December");
            var d = new Date(date_string);
            return month_names[d.getMonth()] + ' ' + d.getDate() + ', ' +
                d.getFullYear() + ' ' + d.toLocaleTimeString();
        },

        processRepoResponse: function(repo, updateAfter2) {

            repo.created_at = this.formatDate.call(this, repo.created_at);
            repo.pushed_at = this.formatDate.call(this, repo.pushed_at);
            repo.updated_at = this.formatDate.call(this, repo.updated_at);

            // If it's a fork, show where it was forked from.
            /*
            if (repo.fork == true) {
                forked_html = Mustache.to_html(forked_from_tmpl, {
                    fork_parent_org: repo.parent.owner.login,
                    fork_parent_org_url: repo.parent.owner.url,
                    fork_parent_name: repo.parent.name,
                    fork_parent_url: repo.parent.url
                });
                repo.forked_html = forked_html;

                /*
                $.ajax({
                    url: github_api_url + 'repos/' + org + '/' + repo + '/pulls',
                    dataType: 'jsonp',
                    success: function() {
                        repo.pulls_count = resp.data.length;
                    },
                    context: my
                });
                *\/
            }
            */

            repos.push(repo);

            if (updateAfter2 == true) {
                this.searchRepos.call(this, query);
            }
        },

        processRepoArrayResponse: function(data, updateAfter) {
            for (var i = 0; i < data.length; i++) {
                this.processRepoResponse.call(this, data[i], false);
            }

            if (updateAfter == true) {
                this.searchRepos.call(this, query);
            }
        },

        loadRepos: function(data, updateAfter) {
            var projects = data.projects;
            for (var i = 0; i < projects.length; i++) {
                var org = projects[i].org;
                var repo = projects[i].repo;
                if (repo == '*') {
                    $.ajax({
                        url: github_api_url + 'orgs/' + org + '/repos',
                        dataType: 'jsonp',
                        cache: true,
                        success: function(response) {
                            my.processRepoArrayResponse(response.data, updateAfter);
                        },
                        context: my
                    });
                } else {
                    $.ajax({
                        url: github_api_url + 'repos/' + org + '/' + repo,
                        dataType: 'jsonp',
                        cache: true,
                        success: function(response) {
                            my.processRepoResponse(response, updateAfter);
                        },
                        context: my
                    });
                }
            }
        },

        init: function() {
            this.loadRepos.call(this, ebay_org_projects, true);
            //this.loadRepos(this, ebay_contributed_projects, true);
        }
    };

    my.init();

    // When the user enters a search query, run the search function.
    $('#search-query').change(function() {
        $.proxy(my.searchRepos, my, $('#search-query').val())();
    });
})();