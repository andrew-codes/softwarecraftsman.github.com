var bitbucket = (function(){
  function render(user, target, repos){
    var i = 0, fragment = '', t = $(target)[0];

    for(i = 0; i < repos.length; i++) {
      fragment += '<li><a href="https://bitbucket.org/'+user+'/'+repos[i].name+'">'+repos[i].name+'</a><p>'+repos[i].description+'</p></li>';
    }
    t.innerHTML = fragment;
  }
  return {
    showRepos: function(options){
      $.ajax({
        url: "https://api.bitbucket.org/1.0/users/"+options.user+"?callback=?"
        , type: 'GET'
        , dataType: "jsonp"
        , error: function (err) { $(options.target + ' li.loading').addClass('error').text("Error loading feed"); }
        , success: function(data) {
          var repos = [];
          if (!data || !data.repositories) { return; }
          for (var i = 0; i < data.repositories.length; i++) {
            if (options.skip_forks && data.repositories[i].fork) { continue; }
            repos.push(data.repositories[i]);
          }
          repos.sort(function(a, b) {
            var aDate = new Date(a.utc_last_updated).valueOf(),
                bDate = new Date(b.utc_last_updated).valueOf();

            if (aDate === bDate) { return 0; }
            return aDate < bDate ? 1 : -1;
          });

          if (options.count) { repos.splice(options.count); }
          render(options.user, options.target, repos);
        }
      });
    }
  };
})();