const puppeteer = require('puppeteer');
const fs = require("fs");


async function selectStateAndGetCityOptions(page, state) {
    // Click on the state option
    await page.select('select[name="_networkhospitallocator_WAR_OICLportlet_:searchLocatorNetworkHospitalForm:state"]', state.optionValue);

    // Add a delay
    await page.waitForTimeout(500); // Adjust the delay as needed

    // Wait for the city select element to be ready
    await page.waitForSelector('select[name="_networkhospitallocator_WAR_OICLportlet_:searchLocatorNetworkHospitalForm:city"]');
    
    // Extract the values of all options within the updated city select element
    const cityOptions = await page.evaluate(() => {
        const citySelect = document.querySelector('select[name="_networkhospitallocator_WAR_OICLportlet_:searchLocatorNetworkHospitalForm:city"]');
        const optionElements = citySelect.querySelectorAll('option');
        return Array.from(optionElements, option => {
            return {
                optionValueCity: option.value,
                optionCityName: option.innerText
            }
        });
    });

    return cityOptions;
}

async function selectCityAndGetHospitalDetails(page, city) {
    // Click on the city option
    await page.select('select[name="_networkhospitallocator_WAR_OICLportlet_:searchLocatorNetworkHospitalForm:city"]', city.optionValueCity);

    // Add a delay
    await page.waitForTimeout(500); // Adjust the delay as needed]

    await page.waitForSelector('[class="ui-paginator-rpp-options ui-widget ui-state-default ui-corner-left"]');

    await page.waitForSelector('.ui-paginator-rpp-options.ui-widget.ui-state-default.ui-corner-left');

    const countSelectorValue = await page.evaluate(() => {
        const numSelect = document.querySelector('.ui-paginator-rpp-options.ui-widget.ui-state-default.ui-corner-left');
        const optionElements = numSelect.querySelectorAll('option');
        let optionLastChild = optionElements[optionElements.length - 1]
        optionLastChild.value = "2000";
        optionLastChild.innerText = "2000"
    })

    await page.select('.ui-paginator-rpp-options.ui-widget.ui-state-default.ui-corner-left', value="2000" );

    await page.waitForTimeout(500)

    // Wait for the table to be updated
    await page.waitForSelector('table[role="grid"] tbody tr');

    // Extract the hospital details from the table
    const hospitalDetails = await page.evaluate((externalCity) => {
        const rows = document.querySelectorAll('table[role="grid"] tbody tr');

        return Array.from(rows, row => {
            const columns = row.querySelectorAll('td[role="gridcell"]');
            return {
                "HospitalName": columns[2].textContent.trim(),
                "Address": columns[3].innerText,
                "City": externalCity.optionCityName,
                "State": columns[3].textContent.trim().split(",").pop(),
                "Contact": columns[4].textContent.trim(),
                "Mobile": columns[5].textContent.trim(),
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
        await page.goto("https://orientalinsurance.org.in/en/network-hospitals");

        // Wait for the first select element to be present on the page
        await page.waitForSelector('select[name="_networkhospitallocator_WAR_OICLportlet_:searchLocatorNetworkHospitalForm:state"]');

        // Extract the values of all options within the first select element
        const stateOptions = await page.evaluate(() => {
            const selectElement = document.querySelector('select[name="_networkhospitallocator_WAR_OICLportlet_:searchLocatorNetworkHospitalForm:state"]');
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
                console.log(`Hospital Details for City ${cityOptions[j]}:`, hospitalDetails);
                result.push(hospitalDetails);
                fs.writeFileSync("oriantal.json", JSON.stringify(result));

            }
        }

    } catch (error) {
        console.error("Error navigating to the page:", error);
    } finally {
        await browser.close();
        console.log(result)
    }
})();