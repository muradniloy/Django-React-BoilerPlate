import Axios from 'axios'
import React, { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { domain } from '../env'
import SingleProduct from './SingleProduct'
import CategoryList from './CategoryList'

const NewHome = () => {
  const { id } = useParams()

  const [category, setCategory] = useState(null) 
  const [products, setProducts] = useState([])       // Always array
  const [pageInfo, setPageInfo] = useState({ next: null, previous: null })
  const [loading, setLoading] = useState(true)

  // Fetch products
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      try {
        if (id) {
          // Category-wise products API
          const res = await Axios.get(`${domain}/api/categories/${id}/products/`)

          // Nested structure handling
          // res.data.results = { category: {...}, results: [...] }
          const data = res.data.results || {}

          setCategory(data.category || null)
          setProducts(data.results || [])

          setPageInfo({
            next: res.data.next || null,
            previous: res.data.previous || null
          })
        } else {
          // All products API
          const res = await Axios.get(`${domain}/api/product/`)
          setCategory(null)
          setProducts(res.data.results || [])
          setPageInfo({
            next: res.data.next || null,
            previous: res.data.previous || null
          })
        }
      } catch (error) {
        console.error("Error fetching products:", error)
        setProducts([])
        setPageInfo({ next: null, previous: null })
        setCategory(null)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [id])

  // Pagination functions
  const nextProducts = async () => {
    if (!pageInfo.next) return
    try {
      const res = await Axios.get(pageInfo.next)

      // Handle both category & all products
      if (id) {
        const data = res.data.results || {}
        setCategory(data.category || null)
        setProducts(data.results || [])
      } else {
        setProducts(res.data.results || [])
      }

      setPageInfo({
        next: res.data.next || null,
        previous: res.data.previous || null
      })
    } catch (error) {
      console.error("Error fetching next products:", error)
    }
  }

  const previousProducts = async () => {
    if (!pageInfo.previous) return
    try {
      const res = await Axios.get(pageInfo.previous)

      if (id) {
        const data = res.data.results || {}
        setCategory(data.category || null)
        setProducts(data.results || [])
      } else {
        setProducts(res.data.results || [])
      }

      setPageInfo({
        next: res.data.next || null,
        previous: res.data.previous || null
      })
    } catch (error) {
      console.error("Error fetching previous products:", error)
    }
  }

  return (
    <div className='container'>
      <h2 className='my-3'>
        {id ? `Category : ${category?.CategoryTitle || ""}` : 'All Products'}
      </h2>

      {loading ? (
        <p>Loading products...</p>
      ) : (
        <div className='row mx-2'>
          <div className='col-md-10'>
            <div className='row my-2'>
              {Array.isArray(products) && products.length > 0 ? (
                products.map((product, i) => (
                  <div className='col-md-4 mb-2' key={i}>
                    <SingleProduct item={product} />
                  </div>
                ))
              ) : (
                <p>No products found</p>
              )}
            </div>

            {/* Pagination */}
            <div className="home_pagation d-flex justify-content-between my-3">
              <button
                onClick={previousProducts}
                className="btn btn-danger"
                disabled={!pageInfo.previous}
              >
                Previous
              </button>

              <button
                onClick={nextProducts}
                className="btn btn-success"
                disabled={!pageInfo.next}
              >
                Next
              </button>
            </div>
          </div>

          <div className='col-md-2'>
            <CategoryList />
          </div>
        </div>
      )}
    </div>
  )
}

export default NewHome
