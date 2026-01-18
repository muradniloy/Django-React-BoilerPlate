import React from 'react'
import { Link } from 'react-router-dom'

const SingleProduct = ({item}) => {
  return (
        <div className="card SingleProduct">
                        <Link to={`/product/${item.id}/`}><img src={item.ProductImage} className="img-fluid img-thumbnail"  alt="..."/></Link>
                        <div className="card-body">
                            <h5 className="card-title">{item?.ProductTitle}</h5>
                            <p className="card-text">{item?.Description.substring(0, 50)}...<Link to={`/product/${item.id}`}>more</Link></p>
                        </div>
                        <ul className="list-group list-group-flush">
                            <li className="list-group-item">Price$ <del>{item?.MarketPrice}</del></li>
                            <li className="list-group-item">Discount Price$ {item?.SellingPrice}</li>
                        </ul>
                        <div className="m-2">
                            <Link to="#" className="add-to-cart-btn">🛒 Add to Cart</Link>

                        </div>
                        </div> 
  )
}

export default SingleProduct