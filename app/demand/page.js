"use client";
import Navbar from '../components/Navbar';
export default function PdfViewer() {
  return (
    <>
    <Navbar/>
    <div style={{ height: "100vh" }}>
     <iframe width="100%" height="100%" frameborder="0" scrolling="no" src="https://1drv.ms/x/c/ffb62b4907d16059/IQTKRxFMqmM3Q4X3qFyhpPkqAcd44KIrFeQK8_plu9gvFRw?wdAllowInteractivity=False&wdHideGridlines=True&wdHideHeaders=True&wdDownloadButton=True&wdInConfigurator=True&wdInConfigurator=True"></iframe>
    </div>
    </>
  );
}