"use client";
import Navbar from '../components/Navbar';
export default function PdfViewer() {
  return (
    <>
    <Navbar/>
    <div style={{ height: "100vh" }}>
      <iframe
        src="/data/myfile.pdf" // path inside /public/
        width="100%"
        height="100%"
        style={{ border: "none" }}
      />
    </div>
    </>
  );
}