import Axios from 'axios'
import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { domain } from '../env'
import SingleProduct from './SingleProduct'
import CategoryList from './CategoryList'

const CategoryProduct = () => {
    
   const {id} = useParams()
   const [category, setCategory]= useState(null)
   useEffect(()=> {
    const getCategoryProduct = async() =>{
        await Axios({
            method: 'get',
            url: `${domain}/api/category/${id}/`
        }).then(response=>{   
            console.log(response.data[0]) 
            setCategory(response.data[0])
        })
    }
    getCategoryProduct ()
   }, [id])
  return (
    <div className='container'>
        <h2>Category : {category?.CategoryTitle} </h2>
        <div className='row mx-2'>
            <div className='col-md-10'>
                <div className='row my-2'>
            {
                    category !==null &&
                    category?.CategoryProducts?.map((product, i) =>
                    (
                       <div className='col-md-4 mb-2' key={i}>
                        <SingleProduct item={product} />
                       </div>
                    
                    ))
                }
                </div>
            </div>
            <div className='col-md-2'>
                    <CategoryList />
            </div>
            </div>
    </div>
    
  )
}

export default CategoryProduct