function(doc) {
  if (doc._id.substr(0, 7) == 'memory:') {
    emit(doc._id.substr(10), {
      "name": doc.memory_name,
      "theme": doc.memory_theme,
      "description": doc.memory_description,
      "geotag": doc.memory_geotag,
      "update": doc.memory_update,
      "privacy": doc.memory_privacy,
      "date": doc.memory_date,
      "id": doc._id,
      "rev": doc._rev
    });
  }
};