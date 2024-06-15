const db = new PouchDB('messages');

function saveMessageInIndexedDB(message) {
  message._id = crypto.randomUUID();
  return db.put(message).then(() => {
    console.log('Message saved in indexedDB');
    self.registration.sync.register('new-post');
    const newResponse = { ok: true, offline: true };

    return new Response(JSON.stringify(newResponse));
  });
}

function postMessagesToApi() {
  const posts = [];
  return db.allDocs({ include_docs: true, descending: true }).then((docs) => {
    docs.rows.forEach((row) => {
      const fetchPromise = fetch('api', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(row.doc),
      }).then(() => db.remove(row.doc));
      posts.push(fetchPromise);
    });

    return Promise.all(posts);
  });
}
