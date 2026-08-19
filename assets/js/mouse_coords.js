const p = document.createElement("p");
p.style.textAlign = "center";
p.style.fontSize = "18pt";
p.innerHTML = "C'mon, move your mouse!"
document.body.append(p);

document.addEventListener("mousemove", e => {
  p.innerHTML = `mouseX: ${e.clientX}, mouseY: ${e.clientY}`;
});

document.addEventListener("DOMContentLoaded", function() {
  const pageData = window.pageData;
  console.log("Page Data: ", pageData);
  // 你现在可以访问 pageData 的各个属性
});
