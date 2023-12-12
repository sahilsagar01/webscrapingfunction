const puppeteer = require("puppeteer");
const fs = require("fs");

async function scraping(state) {
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();
  await page.goto(
    "https://www.godigit.com/health-insurance/digit-cashless-network-hospitals-list"
  );
  await page.waitForTimeout(500);
  await page.waitForSelector('[for="search-state"]');
  await page.click('[for="search-state"]');
  await page.waitForTimeout(500);
  await page.screenshot({ path: "screen.png" });
  // await page.search('#state-feild-display', state);
  await page.waitForTimeout(500);
  await page.waitForSelector("#state-feild-display");
  await page.type("#state-feild-display", state);
  await page.waitForTimeout(500);
  await page.keyboard.press("ArrowDown");
  await page.waitForTimeout(200);
  await page.keyboard.press("Enter");
  // await page.$eval('inputp[name="state-feild-display"]', el => el.value = state);
  await page.waitForTimeout(500);
  await page.waitForSelector(".search-hos-btn");
  await page.click(".search-hos-btn");
  await page.waitForTimeout(500);
  await page.waitForSelector(".workshop-list-container .workshop-list-item");
  const hospitalDetails = await page.evaluate((externalState) => {
    const rows = document.querySelector(".workshop-list-container");
    const hospitals = rows.querySelectorAll(".workshop-list-item");
    const data = Array.from(hospitals, (row) => {
      const hospitalName = row.querySelector("h3");
      const hospitalAddress = row.querySelector("p");
      return {
        HospitalName: hospitalName.textContent.trim(),
        Address: hospitalAddress.textContent.trim(),
        state: externalState,
        cityname: hospitalAddress.textContent.trim().split(",").pop(),
      };
    });
    return data;
  }, state);
  await browser.close();
  return hospitalDetails;
  // await browser.close()
}
(async function main() {
  // .seach-type-main.d-flex.jus-con-betn #search-state

//   const states = [
//     "ANDAMAN AND NICOBAR",
//     "ANDHRA PRADESH",
//     "ARUNACHAL PRADESH",
//     "ASSAM",
//     "BIHAR",
//     "CHANDIGARH",
//     "CHHATTISGARH",
//     "DADRA AND NAGAR HAVELI",
//     "DELHI",
//     "GOA",
//     "GUJARAT",
//     "HARYANA",
//     "HIMACHAL PRADESH",
//     "JAMMU AND KASHMIR",
//     "JHARKHAND",
//     "KARNATAKA",
//     "KERALA",
//     "MADHYA PRADESH",
//     "MAHARASHTRA",
//     "MANIPUR",
//     "MEGHALAYA",
//     "MIZORAM",
//     "NAGALAND",
//     "ODISHA",
//     "PONDICHERRY",
//     "PUNJAB",
//     "RAJASTHAN",
//     "SIKKIM",
//     "TAMIL NADU",
//     "TELANGANA",
//     "TRIPURA",
//     "UTTAR PRADESH",
//     "UTTARAKHAND",
//     "WEST BENGAL",
//   ];
  const states = [
    "ANDHRA PRADESH",
    "ASSAM",
    "BIHAR",
    "CHANDIGARH",
    "CHHATTISGARH",
    "DELHI",
    "GOA",
    "GUJARAT",
    "HARYANA",
    "HIMACHAL PRADESH",
    "JAMMU AND KASHMIR",
    "JHARKHAND",
    "KARNATAKA",
    "KERALA",
    "MADHYA PRADESH",
    "MAHARASHTRA",
    "MANIPUR",
    "MEGHALAYA",
    "NAGALAND",
    "ODISHA",
    "PONDICHERRY",
    "PUNJAB",
    "RAJASTHAN",
    "SIKKIM",
    "TAMIL NADU",
    "TELANGANA",
    "TRIPURA",
    "UTTAR PRADESH",
    "UTTARAKHAND",
    "WEST BENGAL",
  ];

  let result = [];

  for (let index = 0; index < states.length; index++) {
    const state = states[index];
    console.log(state)
    let res = await scraping(state);
    result.push([...res]);
  }
  console.log("line 57", result);
  fs.writeFileSync("godigit.json", JSON.stringify(result));
  // await setPageToState.select();
})();
