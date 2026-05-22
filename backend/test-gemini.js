const apiKey = 'AIzaSyAnRg76nUtzar0epoGzNzQU92W4i64xJcg';
fetch('https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=' + apiKey, {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({contents: [{parts:[{text:'hello'}]}]})
})
.then(r => r.json())
.then(console.log)
.catch(console.error);
