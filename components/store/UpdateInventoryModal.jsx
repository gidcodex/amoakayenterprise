"use client";

import { useEffect, useState } from "react";

export default function UpdateInventoryModal({

    open,
    onClose,
    variant,
    onSaved

}) {

    const [stock,setStock]=useState(0)
    const [sku,setSku]=useState("")
    const [barcode,setBarcode]=useState("")
    const [lowStockAt,setLowStockAt]=useState(5)
    const [loading,setLoading]=useState(false)

    useEffect(()=>{

        if(variant){

            setStock(variant.stock)
            setSku(variant.sku || "")
            setBarcode(variant.barcode || "")
            setLowStockAt(variant.lowStockAt || 5)

        }

    },[variant])

    if(!open) return null

    async function save(){

        try{

            setLoading(true)

            const res=await fetch("/api/store/variant-inventory/update",{

                method:"POST",

                headers:{
                    "Content-Type":"application/json"
                },

                body:JSON.stringify({

                    variantId:variant.id,
                    stock,
                    sku,
                    barcode,
                    lowStockAt

                })

            })

            if(res.ok){

                onSaved()
                onClose()

            }

        }

        finally{

            setLoading(false)

        }

    }

    return(

<div className="fixed inset-0 z-[100] bg-black/40 flex items-center justify-center">

<div className="bg-white rounded-3xl w-full max-w-xl p-8">

<h2 className="text-3xl font-bold mb-8">

Update Variant Inventory

</h2>

<div className="space-y-5">
<div>
<label className="font-medium">
Stock
</label>

<input type="number" value={stock} onChange={(e)=>setStock(e.target.value)}
className="w-full border rounded-xl p-3 mt-2"
/>
</div>
<div>

<label className="font-medium">
SKU
</label>
<input
value={sku}
onChange={(e)=>setSku(e.target.value)}
className="w-full border rounded-xl p-3 mt-2"
/>

</div>

<div>

<label className="font-medium">

Barcode

</label>

<input

value={barcode}

onChange={(e)=>setBarcode(e.target.value)}

className="w-full border rounded-xl p-3 mt-2"

/>

</div>

<div>

<label className="font-medium">

Low Stock Alert

</label>

<input

type="number"

value={lowStockAt}

onChange={(e)=>setLowStockAt(e.target.value)}

className="w-full border rounded-xl p-3 mt-2"

/>

</div>

</div>

<div className="flex justify-end gap-3 mt-8">

<button
onClick={onClose}
className="px-5 py-3 rounded-xl border"
>
Cancel
</button>

<button onClick={save} disabled={loading}
className="bg-green-600 text-white px-6 py-3 rounded-xl"
>

{loading ? "Saving..." : "Save Changes"}

</button>

</div>

</div>

</div>

    )

}