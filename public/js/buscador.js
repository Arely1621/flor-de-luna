function buscar(valor){
  let productos = document.querySelectorAll(".producto")

  productos.forEach(p=>{
    let nombre = p.querySelector("h5").innerText.toLowerCase()
    p.style.display = nombre.includes(valor.toLowerCase()) ? "block" : "none"
  })
}