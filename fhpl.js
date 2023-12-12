const puppeteer = require('puppeteer');
const fs = require("fs");
const inCo = require('./insuranceCompany');
const states = require('./state')





const getcompuny = (company) => {
    return ({
        Insurancename: company.Insurancename,
        InsuranceId: company.InsuranceId,
        States: states
    })
}

const getstateWithCompany = async(page, details) => {
    const requestData = {
        function_name: "api/NetworkHospital/GetCityDetails",
        StateID: details.stateD.StateID,
      };

      const result = await page.evaluate(async (url, data) => {
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(data),
        });
    
        return await response.json();
      }, 'https://m.fhpl.net/fhplWebAPI_QA/api/NetworkHospital/GetCityDetails', requestData);
      const cities = JSON.parse(result.Data)
       return Array.from(cities, city => {
        return {
            cityName: city.Cityname,
            StateId: details.stateD.StateID,
            companyId: details.companyD.InsuranceId
        }
       })
}

const getHospitals = async(page, postBody) => {

         // Set up the request payload
  const requestData = {
    function_name: "api/NetworkHospital/GetNetworkHospitalAndGipsaPPNHospitalDetails",
    InsuranceID: postBody?.companyId,
    StateID: postBody?.StateId,
    Cityname: postBody?.cityName
  };
  

  // Perform the POST request using page.evaluate
  const result = await page.evaluate(async (url, data) => {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });

    return await response.json();
  }, 'https://m.fhpl.net/fhplWebAPI_QA/api/NetworkHospital/GetNetworkHospitalAndGipsaPPNHospitalDetails', requestData);
  const hospitalDetails = JSON.parse(result.Data);
  return Array.from(hospitalDetails, hospitalDetail => {
    return {
        ...hospitalDetail,
        InsuranceID: postBody?.companyId
    }
  })
}

// async function selectCityAndGetHospitalDetails(page, city) {

//     console.log("line no. 61",city.optionCityValue)

//     await page.waitForTimeout(500)
//     await page.waitForSelector('select[id="ContentPlaceHolder1_ddlCity"]');
//     // await page.waitForTimeout(200)
//     // await page.focus('.col-sm-6.city.hideCity .DivSelectyze.css3 a');
//     // await page.keyboard.press('Enter');
//     // await page.waitForTimeout(200);
//     // await page.waitForSelector(`.col-sm-6.city.hideCity .DivSelectyze.css3 .UlSelectize li a[rel="${city.optionValue}"]`);
//     // await page.focus(`.col-sm-6.city.hideCity .DivSelectyze.css3 .UlSelectize li a[rel="${city.optionValue}"]`);
//     // await page.keyboard.press('Enter');
//     // Click on the city option 
//     await page.select('select[id="ContentPlaceHolder1_ddlCity"]', city.optionCityValue);

//     await page.waitForSelector('[id="ContentPlaceHolder1_btnGo"]');

//     await page.click('[id="ContentPlaceHolder1_btnGo"]')

//     // Add a delay
//     await page.waitForTimeout(500); // Adjust the delay as needed



//     // await page.waitForTimeout(500)
//     // Wait for the table to be updated
//     const element = await page.$('table tbody tr');

    
//     if(element !== null){
//         // Extract the hospital details from the table
//         await page.waitForSelector('table tbody tr');
//         const hospitalDetails = await page.evaluate((externalCity) => {
//             const rows = document.querySelectorAll('table tbody tr');
    
//             return Array.from(rows, row => {
//                 const columns = row.querySelectorAll('tr td[align="left"]');

//                 for(let col = 1; col < columns.length; col++){
//                     return {
//                         "HospitalName": columns[0].textContent.trim(),
//                         "Address": columns[2].textContent.trim(),
//                         "City": columns[1].textContent.trim(),
//                         "State": externalCity.State.stateName,
//                         "ContactPerson": columns[3].textContent.trim(),
//                         "ContactNo": columns[4].textContent.trim(),
//                         // "State": columns[3].textContent.trim(),
//                         // "Latitude": columns[5].textContent.trim(),
//                         // "Longitude": columns[6].textContent.trim(),
//                         // columns: columns[0].textContent.trim()
//                     };
//                 }
               
//             });
//         },city);
//         return hospitalDetails;
    
//    }else{
//     return [null]
//    }




    
// }

(async () => {
    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();
    const result = [];

    // companies
    const acko = [];
    const adityaBirlaHealth = [];
    const adityaBirlaSun = [];
    const bajaj = [];
    const careHealth = [];
    const cholamamdalamMS = [];
    const goDigit = [];
    const hdfc = [];
    const icici = [];
    const iffco = [];
    const kotak = [];
    const liberty = [];
    const magma = [];
    const manipalCigna = [];
    const nationalInsurance = [];
    const naviGenral = [];
    const newIndia = [];
    const nivaBupa = [];
    const oriantal = [];
    const reliance = [];
    const royal = [];
    const sbi = [];
    const tataAig = [];
    const unitedIndia = [];
    const universalSompo = [];
    const Zuno =[]

    const CompaniesArr = [acko,adityaBirlaHealth,adityaBirlaSun,bajaj,careHealth,cholamamdalamMS,goDigit,hdfc,icici,iffco,kotak,liberty,magma,manipalCigna,nationalInsurance,naviGenral,newIndia,nivaBupa,oriantal,reliance,royal,sbi,tataAig,unitedIndia,universalSompo,Zuno]


    try {
        // Navigate to the page
        await page.goto("https://www.fhpl.net/#/hospital_networks");


        for(let c = 0; c < inCo.length; c++){
            const stateDetails = getcompuny(inCo[c])
            console.log("compnies name and details", stateDetails);
            let companyNameArr = inCo[c].Insurancename.split(" ");
            let companyFileName = companyNameArr[0]+"_"+companyNameArr[1]+"_"+companyNameArr[2]+"__FHPL"
            console.log("company name in for loop.", companyFileName)

            for(let i = 0; i < stateDetails.States.length; i++){
                // console.log("line no 125",stateDetails.States[i])
                const stateAndCompany = {
                    stateD: stateDetails.States[i],
                    companyD: inCo[c]
                }
                const companyWithState = await getstateWithCompany(page,stateAndCompany);
                console.log(`data for state ${states[i].Statename}`,companyWithState);
                // result.push(companyWithState);
                for(let h = 0; h < companyWithState.length; h++){
                    const hospitalDetails = await getHospitals(page ,companyWithState[h]);
                    console.log('hey fox', hospitalDetails);
                    result.push(hospitalDetails)
                    CompaniesArr[c].push(hospitalDetails)
                   
                    fs.writeFileSync(`${companyFileName}.json`, JSON.stringify(CompaniesArr[c]))
                    fs.writeFileSync("result.json", JSON.stringify(result));
                    
                }
            }

        }
        



       

    } catch (error) {
        console.error("Error navigating to the page:", error);
    } finally {
        await browser.close();

    }
})();