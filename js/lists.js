function loadLists(state) {
  const blockListPromise = loadJSON('disconnect-blocklist.json').then((data) => {
    state.blocklist = processBlockListJSON(data);
  });

  const entityListPromise = loadJSON('disconnect-entitylist.json').then((data) => {
    state.entityList = data;
  });

  const allowedHostsPromise = getAllowedHostsList().then((allowedHosts) => {
    state.allowedHosts = allowedHosts;
  });

  return Promise.all([blockListPromise, entityListPromise, allowedHostsPromise]);
}


function loadJSON(url) {
  return fetch(url)
    .then((res) => res.json());
}


function processBlockListJSON(data) {
  const blocklist = {};

  // remove un-needed categories per disconnect
  delete data.categories['Content'];
  delete data.categories['Legacy Disconnect'];
  delete data.categories['Legacy Content'];

  // parse thru the disconnect blocklist and create
  // local blocklist "grouped" by main domain. I.e.,
  // blocklist["facebook.com"] = http://www.facebook.com
  // blocklist["fb.com"] = http://www.facebook.com
  // blocklist["doubleclick.net"] = http://www.google.com
  // blocklist["google-analytics.com"] = http://www.google.com
  // etc.
  for (let category_name in data.categories) {
    var category = data.categories[category_name];
    var entity_count = category.length;

    for (var i = 0; i < entity_count; i++) {
      var entity = category[i];

      for (let entity_name in entity) {
        var urls = entity[entity_name];

        for (let main_domain in urls) {
          blocklist[main_domain] = [];
          var domains = urls[main_domain];
          var domains_count = domains.length;

          for (var j = 0; j < domains_count; j++) {
            blocklist[domains[j]] = main_domain;
          }
        }
      }
    }
  }

  return blocklist;
}


function getAllowedHostsList() {
  return browser.storage.local.get('allowedHosts').then((item) => {
    if (item.allowedHosts) {
      return item.allowedHosts;
    }
    return [];
  });
}


module.exports = {
  loadLists
};
