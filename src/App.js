import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import Table from 'react-bootstrap/Table'
import Button from 'react-bootstrap/Button'
import { useEffect, useState } from 'react'
import { SidePane } from "react-side-pane";
import Form from 'react-bootstrap/Form'

function App() {
  const getData = () => {
    fetch('products.json'
      , {
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        }
      }
    )
      .then(function (response) {
        return response.json();
      })
      .then(function (myJson) {
        setProducts(myJson)
        setFilteredProducts(myJson)
      });
  }
  useEffect(() => {
    getData()
  }, [])



  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);

  useEffect(() => {
    setCategoryList([...new Set(products.map(e => e.category))])
    setManufacturerList([...new Set(products.map(e => e.manufacturer))])
  }, [products]);

  const [categoryList, setCategoryList] = useState([])
  const [manufacturerList, setManufacturerList] = useState([])

  //form state
  const [category, setCategory] = useState({})
  const [priceRange, setPriceRange] = useState({ minimum: '', maximum: '' })
  const [manufacturer, setManufacturer] = useState([])

  useEffect(() => {
    setCategory(categoryList.reduce((ac, category) => ({ ...ac, [category]: false }), { except: false }))
  }, [categoryList]);

  useEffect(() => {
    setManufacturer(manufacturerList.reduce((ac, manufacturer) => ({ ...ac, [manufacturer]: false }), { except: false }))
  }, [manufacturerList]);

  const [open, setOpen] = useState(false);
  const handleClose = () => {
    setOpen(!open)
  }
  const totalQuantity = products.map(product => product.quantity).reduce((a, b) => a + b, 0)
  const totalCost = products.map(product => product.price).reduce((a, b) => a + b, 0).toFixed(2)
  const averagePrice = products.map(product => product.price).reduce((a, v, i) => (a * i + v) / (i + 1), 0).toFixed(2)
  const mostExpensiveProduct = products.sort((a, b) => a.price - b.price)[0]
  const cheapestProduct = products.sort((a, b) => b.price - a.price)[0]


  const handleCategoryChange = (event) => {
    setCategory({ ...category, [event.target.value]: event.target.checked })
  }
  const handleManufacturerChange = (event) => {
    setManufacturer({ ...manufacturer, [event.target.value]: event.target.checked })
  }

  const handlePriceRange = (event, type) => {
    setPriceRange({ ...priceRange, [type]: event.target.value })
  }
  const applyFilters = () => {
    let products

    //filter by category
    if (!Object.values(category).every((v) => v === false)) {

      let categoryKeys = Object.keys(category)
      let filteredCategories = categoryKeys.filter((key) => {
        return category.except ? !category[key] : category[key]
      })

      products = filteredProducts.filter(product => filteredCategories.includes(product.category))
    }

    //filter by price range
    if (!Object.values(priceRange).every((v) => v.length === 0)) {
      if (priceRange.minimum.length !== 0) {
        products = filteredProducts.filter(product => product.price > priceRange.minimum)
      }
      if (priceRange.maximum.length !== 0) {
        products = filteredProducts.filter(product => product.price < priceRange.maximum)
      }
    }

    //filter by Manufacturer
    if (!Object.values(manufacturer).every((v) => v === false)) {

      let manufacturerKeys = Object.keys(manufacturer)
      let filteredManufacturers = manufacturerKeys.filter((key) => {
        return manufacturer.except ? !manufacturer[key] : manufacturer[key]
      })

      products = filteredProducts.filter(product => filteredManufacturers.includes(product.manufacturer))
    }

    handleClose()
    setFilteredProducts(products)
  }

  const resetFilters = () => {
    setCategory(categoryList.reduce((ac, category) => ({ ...ac, [category]: false }), { except: false }))
    setManufacturer(manufacturerList.reduce((ac, manufacturer) => ({ ...ac, [manufacturer]: false }), { except: false }))
    setPriceRange({ minimum: '', maximum: '' })
    setFilteredProducts(products)
  }

  const [sort, setSort] = useState({ col: '', isAsc: true })

  const handleSort = (col) => {
    let isAsc = col == sort.col ? sort.isAsc : true
    let sortedProducts = isAsc ? filteredProducts.sort((a, b) => a[col].toString().localeCompare(b[col], undefined, { 'numeric': col === 'price' })) : filteredProducts.reverse()

    setSort({ ...sort, col: col, isAsc: !isAsc })

    setFilteredProducts([...sortedProducts])
  }
  return (
    <Container >
      <SidePane open={open} width={30} onClose={handleClose}>
        <Container fluid>
          <Row style={{ display: 'flex', flexDirection: 'row-reverse', margin: '0.5rem' }}>
            <Button style={{ width: "100px", margin: '0.5rem' }} onClick={applyFilters}>Apply</Button>
            <Button style={{ width: "100px", margin: '0.5rem' }} onClick={resetFilters}>Reset</Button>
          </Row>
          <Row>
            <Form style={{ margin: '0.5rem' }}>
              <h3>Filters</h3>
              <div style={{ marginTop: '1rem' }}>
                <h5>Category: </h5>
                <div className="mb-1">
                  {categoryList.map((type) => (
                    <Form.Check
                      style={{ textTransform: 'capitalize' }}
                      key={type}
                      type='checkbox'
                      label={type}
                      checked={category[type]}
                      value={type}
                      onChange={handleCategoryChange}
                    />
                  ))}
                  <Form.Check
                    style={{ textTransform: 'capitalize' }}
                    type='checkbox'
                    label='All except'
                    value='except'
                    checked={category.except}
                    onChange={handleCategoryChange}
                  />
                </div>
              </div>

              <div style={{ marginTop: '1rem', paddingRight: '1rem' }}>
                <h5>Price: </h5>
                <span style={{ display: 'flex', flex: '1', flexDirection: 'row', justifyContent: 'space-between' }}>
                  <Form.Group style={{ flex: '1', marginRight: '0.5rem' }}>
                    <Form.Label>Minimum Price</Form.Label>
                    <Form.Control type="number" value={priceRange.minimum} onChange={(e) => handlePriceRange(e, 'minimum')} />
                  </Form.Group>
                  <Form.Group style={{ flex: '1' }}>
                    <Form.Label>Maximum Price</Form.Label>
                    <Form.Control value={priceRange.maximum} onChange={(e) => handlePriceRange(e, 'maximum')} type="number" />
                  </Form.Group>
                </span>
              </div>

              <div style={{ marginTop: '1rem' }}>
                <h5>Manufacturer: </h5>

                <div className="mb-1">
                  {manufacturerList.map((type) => (
                    <Form.Check
                      style={{ textTransform: 'capitalize' }}
                      type='checkbox'
                      label={type}
                      checked={manufacturer[type]}
                      value={type}
                      onChange={handleManufacturerChange}
                    />
                  ))}
                  <Form.Check
                    style={{ textTransform: 'capitalize' }}
                    type='checkbox'
                    label='All except'
                    value='except'
                    checked={manufacturer.except}
                    onChange={handleManufacturerChange}
                  />

                </div>
              </div>
            </Form>
          </Row>
        </Container>
      </SidePane>

      <Button onClick={handleClose} style={{ marginTop: '1rem', marginBottom: '0.5rem' }} variant="primary">Options</Button>
      <Row style={{ marginLeft: '0.2rem', marginBottom: '0.5rem' }}>
        <Row>
          Total Quantity: {totalQuantity}, Total Cost: {totalCost}
        </Row>
        <Row>
          Average Price of Displayed Products: {averagePrice}
        </Row>
        <Row>
          Most Expensive Product: {mostExpensiveProduct && mostExpensiveProduct.title}, Price:  {mostExpensiveProduct && mostExpensiveProduct.price}
        </Row>
        <Row>
          Cheapest Product: {cheapestProduct && cheapestProduct.title}, Price:  {cheapestProduct && cheapestProduct.price}
        </Row>
      </Row>

      <Row>
        <Col>
          <Table striped bordered hover>
            <thead>
              <tr>
                <th>#</th>
                <th onClick={() => handleSort('category')}>Category</th>
                <th onClick={() => handleSort('price')}>Price</th>
                <th onClick={() => handleSort('manufacturer')}>Manufacturer</th>
                <th onClick={() => handleSort('production_date')}>Production date</th>
              </tr>
            </thead>
            <tbody>
              {
                filteredProducts && filteredProducts.length > 0 && filteredProducts.map((product, index) =>
                  <tr key={index}>
                    <td >{index + 1}</td>
                    <td style={{ textTransform: 'capitalize' }}>{product.category}</td>
                    <td style={{ textTransform: 'capitalize' }}>{product.price}</td>
                    <td style={{ textTransform: 'capitalize' }}>{product.manufacturer}</td>
                    <td style={{ textTransform: 'capitalize' }}>{product.production_date}</td>
                  </tr>
                )
              }
            </tbody>
          </Table></Col>
      </Row>
    </Container>
  );
}

export default App;
