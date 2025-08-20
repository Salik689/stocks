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
         src="https://1drv.ms/x/c/73fd37ac4ae83482/IQRGpDImzYYOT7mg5Lbii0OWAYLyJqgw-ppbz5Bpf2lCc78?wdAllowInteractivity=False&wdHideGridlines=True&wdHideHeaders=True&wdDownloadButton=True&wdInConfigurator=True&wdInConfigurator=True"
      ></iframe>
    </div>

    </>
  );
}
