import React, { useEffect, useState } from 'react'
import Axios from 'axios'
import { domain } from '../env'
import { Link } from 'react-router-dom'

const CategoryList = () => {
  const [allCategory, setAllCategory] = useState([])

  useEffect(() => {
    const getAllCategory = async () => {
      const res = await Axios.get(`${domain}/api/category/`)
      setAllCategory(res.data)
    }
    getAllCategory()
  }, [])

  return (
    <div className="mb-2"> 
    <h5>Category List</h5>
    { 
    allCategory !==null && allCategory?.map((allCategory, i)=>( 
    <div className='my-2' key={i}>
       
      <Link to={`/category/${allCategory?.id}`} className='text-decoration-none fs-5'>
      {allCategory.CategoryTitle}</Link>
       </div> 
      )) 
      } 
       <Link to={`/`} className='text-decoration-none fs-5'>
      All Products</Link>
       </div>
  )
}

export default CategoryList
