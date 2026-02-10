# SimpleStat 📊

SimpleStat is a privacy-focused, browser-based statistical analysis tool. It allows you to perform statistical calculations and generate visualizations directly in your browser without sending any data to a server.

## Features

*   **🔒 Privacy-First**: All data processing happens locally in your browser. No data is ever uploaded to a server.
*   **📂 Flexible Data Input**:
    *   Paste data directly from Excel, Google Sheets, or CSV files.
    *   Upload local CSV files.
*   **📈 Dynamic Visualization**:
    *   Create **Bar**, **Line**, **Scatter**, **Pie**, and **Doughnut** charts instantly.
    *   Interactive charts powered by [Chart.js](https://www.chartjs.org/).
*   **🧮 Statistical Analysis**:
    *   Automatic calculation of variable statistics: **Mean**, **Median**, **Min**, **Max**, **Standard Deviation**.
    *   Detailed count (N) for validating data sets.

## Installation / Usage

1.  Clone this repository:
    ```bash
    git clone https://github.com/albearzero/simple-stat.git
    ```
2.  Navigate to the project directory:
    ```bash
    cd simple-stat
    ```
3.  Open `index.html` in your web browser. That's it! No server or build steps required.

## Demo Data

Copy and paste this sample data to try it out:

```csv
Name,Score,Age,City
Alice,85,23,New York
Bob,90,25,Los Angeles
Charlie,78,22,Chicago
David,92,24,Houston
Eve,88,23,Phoenix
```

## Technologies Used

*   **HTML5 / CSS3**: Core structure and responsive styling.
*   **JavaScript (ES6+)**: Logic and DOM manipulation.
*   **[PapaParse](https://www.papaparse.com/)**: Fast and powerful CSV parser.
*   **[Chart.js](https://www.chartjs.org/)**: Simple yet flexible JavaScript charting for designers & developers.

## License

MIT License. Free to use and modify.