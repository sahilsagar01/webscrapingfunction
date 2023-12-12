const fs = require("fs");
const result = [];

const url = "https://rgi-locator.appspot.com/_ah/api/fusionTableApi/v1/get/bqdata";
const payload = {
    entityName: "HOSPITAL"
};

fetch(url, {
    method: 'POST',
    headers: {
        'Content-Type': 'application/json',
    },
    body: JSON.stringify(payload),
})
    .then(response => {
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        return response.json();
    })
    .then(data => {
        console.log(data);
        result.push(data)
        fs.writeFileSync(`./reliance/reliance.json`, JSON.stringify(result));


    })
    .catch(error => {
        console.error('Error:', error);
    });
