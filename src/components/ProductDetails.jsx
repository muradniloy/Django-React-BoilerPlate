import Axios from 'axios'
import React, { useEffect, useState } from 'react'
import { domain } from '../env'
import { useParams, useNavigate } from 'react-router-dom'
import SingleProduct from './SingleProduct'

const ProductDetails = () => {
    const { id } = useParams()
    const navigate = useNavigate()
    const [products, setProducts] = useState(null)
    const [ProductCategory , setProductCategory] = useState(null)
   
    console.log(products?.Category['id']);
    
    useEffect(() => {
        const getdata = async () => {
            try {
                const response = await Axios({
                    method: "get",
                    url: `${domain}/api/product/${id}/`
                })
                setProducts(response.data)
                getcategory(response?.data?.Category['id'])
            } catch (err) {
                console.log("Error loading product", err)
            }
        }
        getdata()
        
    }, [id])

    const nextProduct = () => {
        const nextId = parseInt(id) + 1
        navigate(`/product/${nextId}/`)
    }

    const prevProduct = () => {
        const prevId = parseInt(id) - 1
        if (prevId > 0) {
            navigate(`/product/${prevId}/`)
        }
    }
    
    const getcategory = async (id) => {
        await Axios ({
            method: 'get',
            url: `${domain}/api/category/${id}/`
        }).then(response =>{
            console.log(response.data);
            setProductCategory(response.data)
        })
    }


    return (
        <div className='container my-5'>
            <div className="row align-items-center">
                
                {/* বাম পাশের কলাম: Previous Button */}
                <div className="col-md-2 text-center">
                    <button 
                        onClick={prevProduct} 
                        className="btn btn-outline-dark rounded-pill px-4 shadow-sm"
                    >
                        ❮ Prev
                    </button>
                </div>

                {/* মাঝখানের কলাম: Product Card */}
                <div className="col-md-8">
                    <div className="card shadow-lg border-0 overflow-hidden">
                        <div className="row g-0">
                            {/* প্রডাক্ট ইমেজ */}
                            <div className="col-md-5 img-bounce">
                                <img 
                                    src={products?.ProductImage} 
                                    className="img-fluid h-100 img-bounce" 
                                    alt={products?.ProductTitle}
                                    style={{ objectFit: 'cover', minHeight: '300px' }}
                                />
                            </div>
                            {/* প্রডাক্ট তথ্য */}
                            <div className="col-md-7">
                                <div className="card-body">
                                    <h3 className="card-title fw-bold">{products?.ProductTitle}</h3>
                                    <hr />
                                    <div className="my-3">
                                        <span className="h4 text-primary fw-bold">${products?.SellingPrice}</span>
                                        <span className="ms-2 text-muted text-decoration-line-through">${products?.MarketPrice}</span>
                                    </div>
                                    <h6>Description</h6>
                                    <p className="card-text text-muted">{products?.Description}</p>
                                    <button className="btn btn-primary w-100 py-2 mt-3">
                                        🛒 Add to Cart
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ডান পাশের কলাম: Next Button */}
                <div className="col-md-2 text-center">
                    <button 
                        onClick={nextProduct} 
                        className="btn btn-outline-dark rounded-pill px-4 shadow-sm"
                    >
                        Next ❯
                    </button>
                </div>

            </div>
            <hr></hr>
            <div className='row'>
                <h5>Related Products</h5>
                {
                    ProductCategory !==null &&
                    ProductCategory[0]?.CategoryProducts?.map((product, i) =>
                    (
                       <div className='col-md-3 mb-2' key={i}>
                        <SingleProduct item={product} />
                       </div> 
                    ))
                }

            </div>
        </div>
    )
}

export default ProductDetails
