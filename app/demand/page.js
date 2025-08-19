import React from 'react'
import Navbar from '../components/Navbar';
export default function ExcelIframe() {
  return (
    <>
    <Navbar />
        <div style={{ width: "100%", overflowX: "auto", padding: "10px" }}>
      <iframe
        width="100%"        // full width
        height="800"        // adjust height as needed
        frameBorder="0"     // React JSX requires camelCase
        scrolling="no"      // optional
        src="https://1drv.ms/x/c/ffb62b4907d16059/IQTKRxFMqmM3Q4X3qFyhpPkqAcd44KIrFeQK8_plu9gvFRw?wdAllowInteractivity=True&wdHideGridlines=True&wdHideHeaders=True&wdDownloadButton=True&wdInConfigurator=True"
      ></iframe>
    </div>

    </>
  );
}
