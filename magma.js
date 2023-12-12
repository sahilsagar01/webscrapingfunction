const puppeteer = require('puppeteer');
const fs = require("fs");


async function selectStateAndGetCityOptions(page, state) {
    // Click on the state option
    await page.select('select[id="_com_magmahdi_esales_hospital_portlet_ComMagmahdiEsalesHospitalPortlet_INSTANCE_Dq68VlwUNbjU_stateDropDown"]', state);
    await page.focus('.col-sm-6.city.state .DivSelectyze.skype a');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(200);
    await page.waitForSelector(`.col-sm-6.city.state .DivSelectyze.skype .UlSelectize li a[rel="${state}"]`);
    await page.focus(`.col-sm-6.city.state .DivSelectyze.skype .UlSelectize li a[rel="${state}"]`);
    await page.keyboard.press('Enter');
    


    // Add a delay
    await page.waitForTimeout(500); // Adjust the delay as needed

    // Wait for the city select element to be ready
    await page.waitForSelector('select[id="_com_magmahdi_esales_hospital_portlet_ComMagmahdiEsalesHospitalPortlet_INSTANCE_Dq68VlwUNbjU_cityDropDown"]');
    
    // Extract the values of all options within the updated city select element
    const cityOptions = await page.evaluate((externalState) => {
        const citySelect = document.querySelector('select[id="_com_magmahdi_esales_hospital_portlet_ComMagmahdiEsalesHospitalPortlet_INSTANCE_Dq68VlwUNbjU_cityDropDown"]');
        const optionElements = citySelect.querySelectorAll('option');
        return Array.from(optionElements, option => {
            return {
                optionValue: option.value,
                State: externalState
            }
        });
    },state);

    return cityOptions;
}

async function selectCityAndGetHospitalDetails(page, city) {

    console.log("line no.27",city.optionValue)

    await page.waitForTimeout(500)
    await page.waitForSelector('select[id="_com_magmahdi_esales_hospital_portlet_ComMagmahdiEsalesHospitalPortlet_INSTANCE_Dq68VlwUNbjU_cityDropDown"]');
    await page.waitForTimeout(200)
    await page.focus('.col-sm-6.city.hideCity .DivSelectyze.css3 a');
    await page.keyboard.press('Enter');
    await page.waitForTimeout(200);
    await page.waitForSelector(`.col-sm-6.city.hideCity .DivSelectyze.css3 .UlSelectize li a[rel="${city.optionValue}"]`);
    await page.focus(`.col-sm-6.city.hideCity .DivSelectyze.css3 .UlSelectize li a[rel="${city.optionValue}"]`);
    await page.keyboard.press('Enter');
    // Click on the city option 
    await page.select('select[id="_com_magmahdi_esales_hospital_portlet_ComMagmahdiEsalesHospitalPortlet_INSTANCE_Dq68VlwUNbjU_cityDropDown"]', city.optionValue);

    await page.waitForSelector('.btn-disabled.locateHospital');

    await page.click('.btn-disabled.locateHospital')

    // Add a delay
    await page.waitForTimeout(500); // Adjust the delay as needed



    await page.waitForTimeout(500)
    // Wait for the table to be updated
    const element = await page.$('table tbody tr');

    
    if(element !== null){
        // Extract the hospital details from the table
        await page.waitForSelector('table tbody tr');
        const hospitalDetails = await page.evaluate((externalCity) => {
            const rows = document.querySelectorAll('table tbody tr');
    
            return Array.from( rows, row => {
                const columns = row.querySelectorAll('td');
                function extractAndStorePincode(pincodeString) {
                    const pincodeMatch = pincodeString?.match(/\b\d{6}\b/);
                    return pincodeMatch?.[0] ?? ''
                    
                  }
                return {
                    HospitalName: columns[0]?.textContent?.trim(),
                    Address: columns[1]?.textContent?.trim(),
                    City: externalCity?.optionValue,
                    State: externalCity?.State,
                    PinCode: extractAndStorePincode(
                        columns[1]?.textContent?.trim()
                      ),
                    // "State": columns[3].textContent.trim(),
                    // "ContactNo": columns[4].textContent.trim(),
                    // "Latitude": columns[5].textContent.trim(),
                    // "Longitude": columns[6].textContent.trim(),
                };
            });
        },city);
        return hospitalDetails;
    
   }else{
    return [null]
   }




    
}

(async () => {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    const result = [];
    try {
        // Navigate to the page
        await page.goto("https://www.magmahdi.com/more/contact-us?f=y");

        // Wait for the first select element to be present on the page
        await page.waitForSelector('select[id="_com_magmahdi_esales_hospital_portlet_ComMagmahdiEsalesHospitalPortlet_INSTANCE_Dq68VlwUNbjU_stateDropDown"]');

        // Extract the values of all options within the first select element
        const stateOptions = await page.evaluate(() => {
            const selectElement = document.querySelector('select[id="_com_magmahdi_esales_hospital_portlet_ComMagmahdiEsalesHospitalPortlet_INSTANCE_Dq68VlwUNbjU_stateDropDown"]');
            const optionElements = selectElement.querySelectorAll('option');
            return Array.from(optionElements, option => option.value);
        });

        console.log('State Options:', stateOptions);

        for (let i = 1; i < stateOptions.length; i++) { 
            const cityOptions = await selectStateAndGetCityOptions(page, stateOptions[i]);
            console.log(`City Options for State ${stateOptions[i]}:`, cityOptions.optionValue);

            for (let j = 1; j < cityOptions.length; j++) {
                const hospitalDetails = await selectCityAndGetHospitalDetails(page, cityOptions[j]);
                console.log(`Hospital Details for City ${cityOptions[j].optionValue}:`, hospitalDetails);
                result.push(hospitalDetails);
                fs.writeFileSync("./magma/magma.json", JSON.stringify(result));

            }
        }

    } catch (error) {
        console.error("Error navigating to the page:", error);
    } finally {
        await browser.close();
        console.log(result)
    }
})();