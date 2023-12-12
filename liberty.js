const puppeteer = require('puppeteer');
const fs = require("fs");


async function selectStateAndGetCityOptions(page, state) {

    await page.waitForTimeout(500);
    await page.waitForSelector('select[id="ddlstate"]')
    // Click on the state option
    await page.select('select[id="ddlstate"]', state.optionValue);

    // Add a delay
    await page.waitForTimeout(500); // Adjust the delay as needed

    // Wait for the city select element to be ready
    await page.waitForSelector('select[id="ddlcity"]');
    
    // Extract the values of all options within the updated city select element
    const cityOptions = await page.evaluate((externalState) => {
        const citySelect = document.querySelector('select[id="ddlcity"]');
        const optionElements = citySelect.querySelectorAll('option');
        return Array.from(optionElements, option => {
            return {
                optionValueCity: option.value,
                optionCityName: option.innerText,
                state: externalState
            }
        });
    },state);

    return cityOptions;
}

async function selectCityAndGetHospitalDetails(page, city) {
    // Click on the city option
    await page.select('select[id="ddlcity"]', city.optionValueCity);

    // Add a delay
    await page.waitForTimeout(500); // Adjust the delay as needed

    await page.waitForSelector('[id="btnsubmit"]');

    await page.click('[id="btnsubmit"]')

    await page.waitForTimeout(500)

    // Wait for the table to be updated
    await page.waitForSelector('div[id="divinnrlftbrnchrbx"] ul');

    // Extract the hospital details from the table
    const hospitalDetails = await page.evaluate((externalCity) => {
        const rows = document.querySelectorAll('div[id="divinnrlftbrnchrbx"] ul');

        return Array.from(rows, row => {
            // const columns = row.querySelectorAll('td[role="gridcell"]');
            const hospitalName = row.querySelector("p b");
            const hospitalAddress = row.querySelector("p")

            function extractAndStorePincode(pincodeString) {
                const pincodeMatch = pincodeString?.match(/\b\d{6}\b/);
                return pincodeMatch?.[0] ?? ''
                
              }

            return {
                HospitalName: hospitalName.textContent.trim(),
                Address: hospitalAddress.textContent.trim(),
                City: externalCity.optionCityName,
                State: externalCity.state.optionName,
                PinCode: extractAndStorePincode(
                    hospitalAddress?.textContent?.trim()
                  ),
                // "State": columns[3].textContent.trim().split(",").pop(),
                // "Contact": columns[4].textContent.trim(),
                // "Mobile": columns[5].textContent.trim(),
            };
        });
    },city);

    return hospitalDetails;
}

(async () => {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    const result = [];
    try {
        // Navigate to the page
        await page.goto("https://www.libertyinsurance.in/products/CPMigration/hospitalLocator");

        // Wait for the first select element to be present on the page
        await page.waitForSelector('select[id="ddlstate"]');

        // Extract the values of all options within the first select element
        const stateOptions = await page.evaluate(() => {
            const selectElement = document.querySelector('select[id="ddlstate"]');
            const optionElements = selectElement.querySelectorAll('option');
            return Array.from(optionElements, option => {
                return {
                    optionValue: option.value,
                    optionName: option.innerHTML
                }
            });
        });



        console.log('State Options:', stateOptions);

        for (let i = 1; i < stateOptions.length; i++) { 
            const cityOptions = await selectStateAndGetCityOptions(page, stateOptions[i]);
            console.log(`City Options for State ${stateOptions[i].optionName}:`, cityOptions);

            for (let j = 1; j < cityOptions.length; j++) {
                const hospitalDetails = await selectCityAndGetHospitalDetails(page, cityOptions[j]);
                console.log(`Hospital Details for City ${cityOptions[j].optionCityName}:`, hospitalDetails);
                result.push(hospitalDetails);
                fs.writeFileSync("liberty.json", JSON.stringify(result));

            }
        }

    } catch (error) {
        console.error("Error navigating to the page:", error); 
    } finally {
        await browser.close();
        console.log(result)
    }
})();