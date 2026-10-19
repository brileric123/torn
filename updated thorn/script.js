
(function () {
  const CART_KEY = "thornedCart";
  const money = value => new Intl.NumberFormat("en-PH", {style:"currency",currency:"PHP",maximumFractionDigits:2}).format(value);
  const readCart = () => { try { return JSON.parse(localStorage.getItem(CART_KEY) || "[]"); } catch (_) { return []; } };
  const saveCart = cart => { localStorage.setItem(CART_KEY, JSON.stringify(cart)); updateCartCounts(); };
  function updateCartCounts() {
    const count = readCart().reduce((sum,item)=>sum+item.qty,0);
    document.querySelectorAll(".cart-count").forEach(el=>el.textContent=count);
  }
  function addItem(product, size, qty=1) {
    const cart=readCart();
    const key=product.name+"|"+(size||"One size");
    const existing=cart.find(item=>item.key===key);
    if(existing) existing.qty+=qty;
    else cart.push({...product,size:size||"One size",qty,key});
    saveCart(cart);
  }
  // Existing mobile navigation
  document.querySelectorAll(".toggle").forEach(btn=>btn.addEventListener("click",()=>{
    const nav=document.querySelector(".header nav");
    if(nav) nav.classList.toggle("open");
  }));
  updateCartCounts();

  const modal=document.querySelector(".modal");
  if(modal) {
    const nameEl=modal.querySelector(".modal-name");
    const priceEl=modal.querySelector(".modal-price");
    const copyEl=modal.querySelector(".modal-copy");
    const sizeSelect=modal.querySelector(".product-size");
    const addBtn=modal.querySelector(".add-cart");
    const buyBtn=modal.querySelector(".buy-now");
    let selected=null;
    document.querySelectorAll(".quick").forEach(btn=>btn.addEventListener("click",()=>{
      const article=btn.closest(".product");
      const image=article?.querySelector(".product-img");
      selected={
        name:btn.dataset.name || article?.querySelector("h3")?.textContent.trim() || "THORNED Product",
        price:Number((btn.dataset.price||"0").replace(/[₱,\s]/g,"")),
        description:btn.dataset.description || "A distinctive piece from the THORNED collection.",
        image:image?.getAttribute("src") || "",
        stock:Number(btn.dataset.stock||12)
      };
      nameEl.textContent=selected.name;
      const modalImage=modal.querySelector(".modal-product-image");
      if(modalImage){modalImage.src=selected.image;modalImage.hidden=!selected.image;modal.querySelector(".modal-rose").style.display=selected.image?"none":"block";}
      priceEl.textContent=money(selected.price);
      copyEl.textContent=selected.description;
      const stock=modal.querySelector(".stock-note");
      if(stock) stock.textContent=selected.stock>0 ? `● IN STOCK — ${selected.stock} AVAILABLE` : "OUT OF STOCK";
      if(sizeSelect) {
        const needsSize=!["accessories.html"].includes(location.pathname.split("/").pop());
        sizeSelect.closest(".size-picker").style.display=needsSize?"block":"none";
        sizeSelect.value="";
      }
      modal.classList.add("open");
    }));
    modal.querySelector(".close")?.addEventListener("click",()=>modal.classList.remove("open"));
    modal.addEventListener("click",e=>{if(e.target===modal)modal.classList.remove("open")});
    function getSize() {
      const picker=modal.querySelector(".size-picker");
      if(picker && picker.style.display!=="none") {
        if(!sizeSelect.value){sizeSelect.focus();alert("Please choose a size first.");return null;}
        return sizeSelect.value;
      }
      return "One size";
    }
    addBtn?.addEventListener("click",()=>{
      if(!selected)return;
      const size=getSize(); if(size===null)return;
      if(selected.stock<=0){alert("Sorry, this product is out of stock.");return;}
      addItem(selected,size);
      addBtn.textContent="ADDED TO CART ✓";
      setTimeout(()=>{addBtn.textContent="ADD TO CART ✦"},1400);
    });
    buyBtn?.addEventListener("click",()=>{
      if(!selected)return;
      const size=getSize(); if(size===null)return;
      if(selected.stock<=0){alert("Sorry, this product is out of stock.");return;}
      addItem(selected,size);
      location.href="checkout.html";
    });
  }

  const cartContainer=document.querySelector("#cart-items");
  if(cartContainer) {
    function renderCart(){
      const cart=readCart();
      cartContainer.innerHTML="";
      if(!cart.length){
        cartContainer.innerHTML='<div class="empty-cart"><p>Your cart is waiting in the shadows.</p><a class="button" href="shop.html">EXPLORE THE COLLECTION ↗</a></div>';
      } else {
        cart.forEach(item=>{
          const row=document.createElement("article"); row.className="cart-item";
          const img=document.createElement("img"); img.src=item.image||""; img.alt=item.name;
          if(!item.image) img.hidden=true;
          const details=document.createElement("div"); details.className="cart-item-details";
          const title=document.createElement("h3"); title.textContent=item.name;
          const size=document.createElement("p"); size.textContent="Size: "+item.size;
          const price=document.createElement("p"); price.textContent=money(item.price)+" each";
          const qty=document.createElement("div"); qty.className="quantity-control";
          const minus=document.createElement("button"); minus.textContent="−"; minus.setAttribute("aria-label","Decrease quantity");
          const number=document.createElement("span"); number.textContent=item.qty;
          const plus=document.createElement("button"); plus.textContent="+"; plus.setAttribute("aria-label","Increase quantity");
          const remove=document.createElement("button"); remove.className="remove-item"; remove.textContent="REMOVE";
          minus.onclick=()=>{const c=readCart();const x=c.find(i=>i.key===item.key);if(x){x.qty--;if(x.qty<=0)c.splice(c.indexOf(x),1)}saveCart(c);renderCart()};
          plus.onclick=()=>{const c=readCart();const x=c.find(i=>i.key===item.key);if(x)x.qty++;saveCart(c);renderCart()};
          remove.onclick=()=>{saveCart(readCart().filter(i=>i.key!==item.key));renderCart()};
          qty.append(minus,number,plus,remove); details.append(title,size,price,qty); row.append(img,details);
          const subtotal=document.createElement("strong");subtotal.className="cart-subtotal";subtotal.textContent=money(item.price*item.qty);row.append(subtotal);
          cartContainer.append(row);
        });
      }
      const total=cart.reduce((sum,item)=>sum+item.price*item.qty,0);
      const totalEl=document.querySelector("#cart-total"); if(totalEl)totalEl.textContent=money(total);
      const checkout=document.querySelector("#checkout-link");if(checkout)checkout.style.display=cart.length?"inline-flex":"none";
    }
    renderCart();
    document.querySelector("#clear-cart")?.addEventListener("click",()=>{saveCart([]);renderCart()});
  }

  
const checkoutForm = document.querySelector("#checkout-form");

if (checkoutForm) {
    const summary = document.querySelector("#checkout-summary");
    const promoInput = document.querySelector("#discount-code");
    const applyPromoButton = document.querySelector("#apply-discount");
    const promoMessage = document.querySelector("#discount-message");

    let appliedDiscountCode = "";

    const SHIPPING_FEE = 99;
    const DISCOUNT_RATE = 0.10;

    function calculateTotals(cart) {
        const subtotal = cart.reduce(
            (sum, item) => sum + item.price * item.qty,
            0
        );

        const discount =
            appliedDiscountCode === "THORN10"
                ? subtotal * DISCOUNT_RATE
                : 0;

        const shipping = cart.length > 0 ? SHIPPING_FEE : 0;

        return {
            subtotal,
            discount,
            shipping,
            total: subtotal - discount + shipping
        };
    }

    function renderSummary() {
        const cart = readCart();
        summary.innerHTML = "";

        if (!cart.length) {
            summary.innerHTML =
                '<p>Your cart is empty. <a href="shop.html">Return to the shop.</a></p>';

            checkoutForm.querySelector(
                'button[type="submit"]'
            ).disabled = true;

            return;
        }

        checkoutForm.querySelector(
            'button[type="submit"]'
        ).disabled = false;

        cart.forEach(item => {
            const p = document.createElement("p");

            p.textContent =
                `${item.name} · ${item.size} × ${item.qty} — ` +
                money(item.price * item.qty);

            summary.append(p);
        });

        const totals = calculateTotals(cart);

        const subtotalLine = document.createElement("p");
        subtotalLine.textContent = "Subtotal: " + money(totals.subtotal);
        summary.append(subtotalLine);

        const discountLine = document.createElement("p");
        discountLine.textContent =
            "Discount: -" + money(totals.discount);
        summary.append(discountLine);

        const shippingLine = document.createElement("p");
        shippingLine.textContent =
            "Shipping fee: " + money(totals.shipping);
        summary.append(shippingLine);

        const totalLine = document.createElement("strong");
        totalLine.textContent = "Total: " + money(totals.total);
        summary.append(totalLine);
    }

    applyPromoButton.addEventListener("click", () => {
        const enteredCode = promoInput.value.trim().toUpperCase();

        if (enteredCode === "THORN10") {
            appliedDiscountCode = "THORN10";
            promoMessage.textContent =
                "Discount applied! You saved 10% on your products.";
            promoMessage.style.color = "#91b58b";
        } else {
            appliedDiscountCode = "";
            promoMessage.textContent =
                "Invalid code. Please try again.";
            promoMessage.style.color = "#d58b8b";
        }

        renderSummary();
    });

    renderSummary();

    checkoutForm.addEventListener("submit", e => {
        e.preventDefault();

        const cart = readCart();

        if (!cart.length) {
            alert("Your cart is empty.");
            return;
        }

        const totals = calculateTotals(cart);
        const data = Object.fromEntries(
            new FormData(checkoutForm).entries()
        );

        const orderNo = "TH-" + Date.now().toString().slice(-8);

        document.querySelector("#checkout-result").innerHTML = `
            <h2>ORDER DETAILS RECEIVED</h2>
            <p>Thank you, ${escapeText(data.fullName)}.</p>
            <p>Your demo order reference is <strong>${orderNo}</strong>.</p>
            <p>Order total: <strong>${money(totals.total)}</strong></p>
            <p>This is a front-end demo. No payment has been processed
            and no order was sent to a store.</p>
        `;

        document.querySelector("#checkout-result").hidden = false;

        saveCart([]);
        checkoutForm.reset();

        appliedDiscountCode = "";
        promoMessage.textContent = "";

        renderSummary();
    });
}
  function escapeText(value){return String(value||"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));}
})();


/* THORNED PRODUCT SEARCH
   Added separately to preserve existing website features. */
(() => {
    function initializeThornedSearch() {
        const searchInput = document.getElementById("thorned-search-input");
        const clearButton = document.getElementById("thorned-search-clear");
        const status = document.getElementById("thorned-search-status");

        if (!searchInput || !clearButton || !status) return;

        const products = Array.from(document.querySelectorAll(".products .product"));

        function searchProducts() {
            const query = searchInput.value.trim().toLowerCase();
            let visibleCount = 0;

            products.forEach((product) => {
                const name =
                    product.querySelector(".product-info h3")?.textContent || "";

                const category =
                    product.querySelector(".product-info small")?.textContent || "";

                const description =
                    product.querySelector(".quick")?.dataset.description || "";

                const searchableText =
                    `${name} ${category} ${description}`.toLowerCase();

                const matches = searchableText.includes(query);

                product.classList.toggle("search-hidden", !matches);

                if (matches) visibleCount++;
            });

            if (query === "") {
                status.textContent = `${products.length} PRODUCTS`;
            } else if (visibleCount === 0) {
                status.textContent = "NO PRODUCTS FOUND. TRY ANOTHER SEARCH.";
            } else {
                status.textContent =
                    `${visibleCount} PRODUCT${visibleCount === 1 ? "" : "S"} FOUND`;
            }
        }

        searchInput.addEventListener("input", searchProducts);

        clearButton.addEventListener("click", () => {
            searchInput.value = "";
            searchProducts();
            searchInput.focus();
        });

        searchProducts();
    }

    if (document.readyState === "loading") {
        document.addEventListener("DOMContentLoaded", initializeThornedSearch);
    } else {
        initializeThornedSearch();
    }
})();


/* THORNED CUSTOMER RATINGS */
(() => {
    const STORAGE_KEY = "thornedCustomerRatings";

    const form = document.querySelector("#rating-form");

    if (!form) return;

    const starButtons = [...form.querySelectorAll("[data-rating]")];
    const nameInput = document.querySelector("#rating-name");
    const reviewInput = document.querySelector("#rating-review");
    const message = document.querySelector("#rating-message");

    const averageRating = document.querySelector("#average-rating");
    const averageStars = document.querySelector("#average-stars");
    const ratingCount = document.querySelector("#rating-count");
    const ratingList = document.querySelector("#rating-list");

    let selectedRating = 0;

    function readRatings() {
        try {
            const ratings = JSON.parse(
                localStorage.getItem(STORAGE_KEY) || "[]"
            );

            return Array.isArray(ratings) ? ratings : [];
        } catch {
            return [];
        }
    }

    function selectRating(value) {
        selectedRating = value;

        starButtons.forEach(button => {
            const active = Number(button.dataset.rating) <= value;

            button.classList.toggle("selected", active);
            button.setAttribute("aria-pressed", String(active));
        });
    }

    starButtons.forEach(button => {
        button.addEventListener("click", () => {
            selectRating(Number(button.dataset.rating));
            message.textContent = "";
        });
    });

    function renderRatings() {
        const ratings = readRatings();

        ratingList.replaceChildren();

        if (ratings.length === 0) {
            averageRating.textContent = "0.0";
            averageStars.textContent = "☆☆☆☆☆";
            ratingCount.textContent = "No ratings yet. Be the first.";
            return;
        }

        const average = ratings.reduce(
            (sum, rating) => sum + rating.stars, 0
        ) / ratings.length;

        averageRating.textContent = average.toFixed(1);

        averageStars.textContent =
            "★".repeat(Math.round(average)) +
            "☆".repeat(5 - Math.round(average));

        ratingCount.textContent =
            `${ratings.length} customer rating${ratings.length === 1 ? "" : "s"}`;

        ratings.slice().reverse().slice(0, 5).forEach(rating => {
            const card = document.createElement("article");
            card.className = "rating-card";

            const stars = document.createElement("div");
            stars.className = "rating-stars";
            stars.textContent =
                "★".repeat(rating.stars) +
                "☆".repeat(5 - rating.stars);

            const name = document.createElement("strong");
            name.textContent = rating.name || "THORNED Customer";

            const review = document.createElement("p");
            review.textContent = rating.review || "Rated the THORNED collection.";

            card.append(stars, name, review);
            ratingList.append(card);
        });
    }

    form.addEventListener("submit", event => {
        event.preventDefault();

        if (selectedRating < 1 || selectedRating > 5) {
            message.textContent = "Please select a star rating first.";
            return;
        }

        const ratings = readRatings();

        ratings.push({
            stars: selectedRating,
            name: nameInput.value.trim(),
            review: reviewInput.value.trim()
        });

        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(ratings));
        } catch {
            message.textContent =
                "Your rating could not be saved in this browser.";
            return;
        }

        form.reset();
        selectRating(0);

        message.textContent = "Thank you for rating THORNED!";
        renderRatings();
    });

    renderRatings();
})();
