import { Router } from 'express'
import persistenceFactory from '../dao/Factory.js'
import config from '../config/config.js'
import jwt from 'jsonwebtoken'

const router = Router()

router.get('/', (req,res)=>{
    const token = req.cookies[config.jwt.COOKIE]
    if(!token) return res.render('index', {user:false})
    const user = jwt.verify(token, config.jwt.SECRET)
    res.render('index', {user})
})

router.get('/login', (req,res)=>{
    res.render('login')
})

router.get('/register', (req,res)=>{
    res.render('register')
})

router.get('/cart', async(req,res)=>{
    const token = req.cookies[config.jwt.COOKIE]
    if(!token) return res.render('account', {user:false})
    const user = jwt.verify(token, config.jwt.SECRET)
    const wholeUser = await persistenceFactory.UserService.getByEmail(user.email)
    let cart = await persistenceFactory.CartService.getCartId(wholeUser.cartId)
    let total = 0
    cart.products.forEach(element => {
        total += element.product.price * element.qty
    })
    res.render('cart',{cart,total})
})

router.get('/productDetail/:pid', async(req,res)=>{
    try {
        let product = await persistenceFactory.ProductService.getById(req.params.pid)
        res.render('detail',{product})
    } catch (error) {
        res.status(500).send('insternal error')
    }
})

router.get('/account', async(req,res)=>{
    const token = req.cookies[config.jwt.COOKIE]
    if(!token) return res.render('account', {user:false})
    let userToken = jwt.verify(token, config.jwt.SECRET)
    let user = await persistenceFactory.UserService.getByEmail(userToken.email)
    if(user.password) delete user.password
    res.render('account',{user})
})

router.get('/category', async(req,res)=>{
    const ctg = req.query.category
    if(ctg === 'all'){
        let products = await persistenceFactory.ProductService.getAll()
        res.render('category',{products})
    }else{
        let products = await persistenceFactory.ProductService.findByCategory(ctg)
        res.render('category',{products})
    }
})

export default router