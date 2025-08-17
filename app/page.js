
"use client";
import Image from "next/image";
import './page.css'
import { useForm } from "react-hook-form";
import Navbar from "./components/Navbar";


export default function Home() {

  const {
    register,
    reset,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm()



  const onSubmit = async (data) => {
    await new Promise((res) => setTimeout(res, 300));
    reset();
    console.log(data);


    try {

      const res = await fetch("/api/save-form", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data) // Send the combined data to our backend
      });

    } catch (error) {
      console.log("Error submitting form:", error);

    }
  }
  return (
    <>
      <Navbar />
      <div className="form">
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="input">
          <label htmlFor="itemName">Item Name</label>
          <input
            type="text"
            placeholder="Enter item name"
            name="itemName"
            id="itemName"
            {...register("itemName", {
              required: "name reqiured",
            })}
          />

        </div>
        <div className="input">
          <label htmlFor="itemQuantity">Item Quantity</label>
          <input
            type="number"
            placeholder="Enter the item quantity"
            name="itemQuantity"
            id="itemQuantity"
            {...register("itemQuantity", {

            })}
          />
          </div>
        <div className="input">
          <label htmlFor="number">Item Number</label>
          <input
            type="number"
            placeholder="Enter the item number"
            name="number"
            id="number"
            {...register("Number", {

            })}
          />

        </div>
        <div className="input">
          <label htmlFor="itemLocation">Item Location</label>
          <input
            type="text"
            placeholder="Enter item location e.g A1 ,B5"
            name="itemLocation"
            id="itemLocation"
            {...register("itemLocation", {

            })}
          />
        </div>
        <div className="submit">
          <button className="submitBtn" type="submit" >Submit</button>
        </div>
      </form>
      </div>
    </>
  );
}
