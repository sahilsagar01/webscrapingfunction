const puppeteer = require('puppeteer');
const fs = require("fs");

async function selectStateByCompany(page, company){
    await page.waitForSelector('select[id="insCompseqId"]');

    await page.select('select[id="insCompseqId"]', company.optionCompanyValue)

    await page.waitForTimeout(500);

    await page.waitForSelector('[id="stateid"]')

    const stateOptions = await page.evaluate((externalCompany) => {
        const selectElement = document.querySelector('select[id="stateid"]');
        const optionElements = selectElement.querySelectorAll('option');
        return Array.from(optionElements, option => {
            return {
                stateName: option.textContent.trim(),
                stateValue: option.value,
                companyName: externalCompany.optionCompanyName
            }
        });

    },company);
    return stateOptions
}


async function selectCityAndGetHospitalDetails(page, state) {

    console.log("line no. 63",state.stateName)

    await page.waitForTimeout(500)
    await page.waitForSelector('select[id="stateid"]');
    // await page.waitForTimeout(200)
    // await page.focus('.col-sm-6.city.hideCity .DivSelectyze.css3 a');
    // await page.keyboard.press('Enter');
    // await page.waitForTimeout(200);
    // await page.waitForSelector(`.col-sm-6.city.hideCity .DivSelectyze.css3 .UlSelectize li a[rel="${city.optionValue}"]`);
    // await page.focus(`.col-sm-6.city.hideCity .DivSelectyze.css3 .UlSelectize li a[rel="${city.optionValue}"]`);
    // await page.keyboard.press('Enter');
    // Click on the city option 
    await page.select('select[id="stateid"]', state.stateValue);

    await page.waitForTimeout(500)

    await page.waitForSelector('[id="SearchId"]');

    await page.click('[id="SearchId"]')

    // Add a delay
    await page.waitForTimeout(1000); // Adjust the delay as needed

    await page.waitForSelector('select[name="hosptableid_length"]');

    const countSelectorValue = await page.evaluate(() => {
        const numSelect = document.querySelector('select[name="hosptableid_length"]');
        const optionElements = numSelect.querySelectorAll('option');
        let optionLastChild = optionElements[optionElements.length - 1]
        optionLastChild.value = "2000";
        optionLastChild.innerText = "2000"
    })

    await page.select('select[name="hosptableid_length"]', value="2000" );

    await page.waitForTimeout(500)

    await page.waitForSelector('.dataTables_info#hosptableid_info');




    // const lengthOfText = paginationText.length;

    // const numOfData = paginationText.slice(lengthOfText - 2, lengthOfText - 1);
    // await page.waitForTimeout(500)
    // Wait for the table to be updated
    const element = await page.$('table tbody tr');

    
    if(element !== null){
        // Extract the hospital details from the table
        await page.waitForSelector('table tbody tr');


        const hospitalDetails = await page.evaluate((externalCompanyName) => {





            const rows = document.querySelectorAll('table tbody tr[role="row"]');


    
            return Array.from(rows, row => {
                // const DataLength = DataText.length;
                // const totalData = DataText.slice(DataLength - 2, DataLength -1)
                const columns = row.querySelectorAll('td');


                    return {
                        "InsuranceCompanyName": externalCompanyName.companyName,
                        "HospitalName": columns[0].textContent.trim(),
                        "Address": columns[1].textContent.trim(),
                        "City": columns[2].textContent.trim(),
                        "State": columns[3].textContent.trim(),
                        "Pincode": columns[1].textContent.trim().split(",").pop(),
                    };
                
               
            });
        },state);
        return hospitalDetails;
    
   }else{
    return [null]
   }




    
}

(async () => {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    const result = [];

    // companies
    const ADITYA = [];
    const BAJAJ = [];
    const CARE = [];
    const CHOLAMANDALAM = [];
    const FUTURE = [];
    const GO = [];
    const HDFC = [];
    const ICICI = [];
    const IFFCO = [];
    const LIBERTY = [];
    const MAGMA = [];
    const MANIPALCIGNA = [];
    const NATIONAL = [];
    const NEW = [];
    const NIVA= [];
    const ORIENTAL = [];
    const RELIANCE = [];
    const ROYAL = [];
    const SBI = [];
    const TATA = [];
    const UNITED = [];
    const UNIVERSAL = [];
    const Zuno =[]

    // All companies in vidal
    const CompaniesArr = [ADITYA,BAJAJ,CARE,CHOLAMANDALAM,FUTURE,GO,HDFC,ICICI,IFFCO,LIBERTY,MAGMA,MANIPALCIGNA,NATIONAL,NEW,NIVA,ORIENTAL,RELIANCE,ROYAL,SBI,TATA,UNITED,UNIVERSAL,Zuno]















    try {
        // Navigate to the page
        await page.goto("https://tips.vidalhealthtpa.com/vidalhealth/HospNetwork.htm");

        // Wait for the first select element to be present on the page
        await page.waitForSelector('select[id="insCompseqId"]');



        // wait for company
        const company = await page.evaluate(() => {
            const selectCompany = document.querySelector('select[id="insCompseqId"]');
            const optionElements = selectCompany.querySelectorAll('option');
            return Array.from(optionElements, option => {
                return {
                    optionCompanyValue: option.value,
                    optionCompanyName: option.innerText
                }
            });
        });


        console.log('Company Option :', company);

        for(let c = 1; c < company.length; c++){
            const stateOptionss = await selectStateByCompany(page, company[c]);
            console.log('State Options:', stateOptionss);
            let companyNameArr = company[c].optionCompanyName.split(" ");
            // let companyNameLen = companyNameArr.length;
            let companyFileName = companyNameArr[0]+"_"+companyNameArr[1]+"_"+companyNameArr[2]+"__vidal"
            console.log("company name in for loop.", companyFileName)


            
            
            for (let i = 1; i < stateOptionss.length; i++) { 
                // const cityOptions = await selectStateAndGetCityOptions(page, stateOptionss[i]);
                const hospitalDetails = await selectCityAndGetHospitalDetails(page, stateOptionss[i]);
                console.log(`Hospital Details for City ${stateOptionss[i].stateName}:`, hospitalDetails);
                result.push(hospitalDetails);
                CompaniesArr[c - 1].push(hospitalDetails);

                fs.writeFileSync(`${companyFileName}.json`, JSON.stringify(CompaniesArr[c - 1]));
                fs.writeFileSync(`vidal.json`, JSON.stringify(result));
                

                // for (let j = 1; j < cityOptions.length; j++) {
                // }
            }
        }
        // Extract the values of all options within the first select element
       


       

    } catch (error) {
        console.error("Error navigating to the page:", error);
    } finally {
        await browser.close();
        // console.log(result)
    }
})();