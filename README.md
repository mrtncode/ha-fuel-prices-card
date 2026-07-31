[![HACS validation](https://img.shields.io/github/actions/workflow/status/mrtncode/ha-fuel-prices-card/hacs-validation.yml?label=HACS%20Validation)](https://github.com/mrtncode/ha-fuel-prices-card/actions?query=workflow%3Avalidate)
![Downloads](https://img.shields.io/github/downloads/mrtncode/ha-fuel-prices-card/total?label=Downloads&color=blue) 
[![GitHub release](https://img.shields.io/github/release/mrtncode/ha-fuel-prices-card?include_prereleases=&sort=semver&color=blue)](https://github.com/mrtncode/ha-fuel-prices-card/releases/)
![stars](https://img.shields.io/github/stars/mrtncode/ha-fuel-prices-card)


# ha-fuel-prices-card
Fuel prices Dashboard card for Home Assistant.

Based on https://github.com/rolandzeiner/tankstellen-austria (MIT). Thanks!



## Installation

### HACS (Recommended)

- Add this repository to HACS. To do so, use the following link.

 [![Open your Home Assistant instance and open a repository inside the Home Assistant Community Store.](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=mrtncode&repository=ha-fuel-prices-card&category=plugin)



<details>
  <summary> <b>Manual Installation via Hacs</b></summary>  

1.  Open HACS in Home Assistant  and click the three dots in the top right corner.
2.  Select "Custom repositories".
3.  Add the URL from the GitHub repository and select "Dashboard" as the category.
4.  Click "add".
5.  The "Fuel Prices Card" should now be available in HACS. Click "install".
6.  The resource will be added to your dashboard configuration automatically.
</details>

<details>
  <summary> <b>Manual Installation in HA</b></summary>  

### Manual Installation

1.  Download the `dist/fuel-prices-card.js` file from the repo.
2.  Place the `fuel-prices-card.js` in `config/www/fuel-prices-card/`.
3.  Add the resource to your Lovelace configuration through the Home Assistant UI:
    a. Go to "Settings" -> "Dashboards".
    b. Click on the three dots in the top right corner and select "Resources".
    c. Click on "+ ADD RESOURCE".
    d. Enter `/local/fuel-prices-card/fuel-prices-card.js` as the URL and select "JavaScript Module" as the Resource type.
    e. Click "CREATE".
4.  Restart Home Assistant.
</details>


# Development

## Dev-Server 
- npm run build -- --watch (automatically rebuilding)
- npm run preview to serve the built file
HA -> Add dashboard resource -> http://localhost:4173/fuel-prices-card.js

## Production build
npm run build
