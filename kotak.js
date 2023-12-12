const https = require("https");
const fs = require("fs");

const url = "https://strapiprod.kotakgeneral.com/api/hospital-lists?&sort[0]=HospitalName:asc";

https.get(url, function (response) {
    let data = "";

    response.on("data", function (chunk) {
        data += chunk;
    });

    response.on("end", function () {
        try {
            const hospitalList = JSON.parse(data);
            console.log(hospitalList.data);
            console.log(hospitalList.data.length)
            fs.writeFileSync("kotakData.json", JSON.stringify(hospitalList.data));
        } catch (error) {
            console.error("Error parsing JSON:", error.message);
        }
    });
}).on("error", function (error) {
    console.error("Error making HTTP request:", error.message);
});
