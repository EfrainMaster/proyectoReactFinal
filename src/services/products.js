import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  updateDoc,
  writeBatch,
} from 'firebase/firestore'
import { db } from '../firebase'

const productsCollection = 'productos'

function getProductsCollection() {
  if (!db) {
    throw new Error('Firebase no está configurado. Completa las variables VITE_FIREBASE_*.')
  }

  return collection(db, productsCollection)
}

export async function getProducts() {
  const snapshot = await getDocs(getProductsCollection())
  return snapshot.docs.map((productDoc) => ({ ...productDoc.data(), id: productDoc.id }))
}

export async function getProduct(productId) {
  const productRef = doc(getProductsCollection(), productId)
  const snapshot = await getDoc(productRef)
  return snapshot.exists() ? { ...snapshot.data(), id: snapshot.id } : null
}

export async function createProduct(product) {
  const productRef = await addDoc(getProductsCollection(), product)
  return { ...product, id: productRef.id }
}

export async function updateProduct(productId, product) {
  const productRef = doc(getProductsCollection(), productId)
  await updateDoc(productRef, product)
  return { ...product, id: productId }
}

export async function deleteProduct(productId) {
  await deleteDoc(doc(getProductsCollection(), productId))
}

export async function importLegacyProducts(products) {
  const productCollection = getProductsCollection()
  const existingSnapshot = await getDocs(productCollection)
  const existingIds = new Set(existingSnapshot.docs.map((productDoc) => productDoc.id))
  const productIds = new Set()
  const productsToImport = products.filter((product) => {
    const productId = String(product.id)

    if (!/^[A-Za-z0-9_-]+$/.test(productId)) {
      throw new Error(`El producto "${product.nombre}" tiene un ID no válido.`)
    }

    if (productIds.has(productId)) {
      throw new Error(`El catálogo contiene el ID duplicado ${productId}.`)
    }
    productIds.add(productId)

    return !existingIds.has(productId)
  })

  for (let index = 0; index < productsToImport.length; index += 500) {
    const batch = writeBatch(db)
    const batchProducts = productsToImport.slice(index, index + 500)

    batchProducts.forEach((product) => {
      const { id: productId, ...productData } = product
      batch.set(doc(productCollection, String(productId)), productData)
    })

    await batch.commit()
  }

  return {
    imported: productsToImport.length,
    skipped: products.length - productsToImport.length,
  }
}
