const { BasePage } = require('./BasePage'); 

class ProductPage extends BasePage {
  constructor(page) {
    super(page); 
    this.addToCartButton = page.getByRole('button', { name: /add to cart/i });
    this.cartIcon = page.getByRole('button', { name: /cart|bag/i }).or(page.locator('a[href*="cart"]'));
    this.replaceCartButton = page.getByRole('button', { name: /yes, replace cart/i });
  }

  async hasProductsAvailable() {

    console.log('CHECKING PRODUCT AVAILABILITY');

    await this.page.waitForTimeout(1500);

    const productCards = this.page.locator(
        [
            '[data-testid*="product"]',
            '[class*="product-card"]',
            '[class*="ProductCard"]',
            '.product-card'
        ].join(',')
    );

    const count = await productCards.count();

    console.log(`Product cards detected: ${count}`);

    if (count > 0) {

        console.log('Products are available.');

        return true;
    }


    const noProductMessage = this.page.getByText(
        /no products|no product|products not found|no results|no items|not available/i
    ).first();

    const noProductsVisible = await noProductMessage.isVisible({timeout: 2000}).catch(() => false);

    if (noProductsVisible) {

        console.log('No products available for the selected filters.');

        return false;
    }


    const addToCart = this.page.getByRole('button', {name: /add to cart/i}).first();

    const addToCartVisible = await addToCart.isVisible({timeout: 3000}).catch(() => false);

    if (addToCartVisible) {

        console.log('Add to Cart button detected. Product available.');

        return true;
    }

    console.log('No product could be confirmed.');

    return false;
}



  async addProductToCart(PRODUCT_INDEX) {

    console.log(
        `Adding product at index ${PRODUCT_INDEX} to cart...`
    );

    const addButton =
        this.addToCartButton.nth(PRODUCT_INDEX);

    await addButton.waitFor({
        state: 'visible',
        timeout: 5000
    });

    await addButton.scrollIntoViewIfNeeded();

    await addButton.click();

    if (
        await this.replaceCartButton.isVisible({
            timeout: 2000
        }).catch(() => false)
    ) {

        console.log(
            'Found an active multi-store cart overlay. Clearing previous session items...'
        );

        await this.replaceCartButton.click();
    }

    await this.page.waitForTimeout(500);

    console.log(
        `Product at index ${PRODUCT_INDEX} added successfully.`
    );
}

  async navigateToCart() {
    await this.cartIcon.first().waitFor({ state: 'visible', timeout: 5000 });
    await this.page.waitForTimeout(500);

    try{
      await this.cartIcon.first().click({ force: true });
    }catch (error) {
    
      await this.page.keyboard.press('Escape');
      await this.page.waitForTimeout(200);
      await this.cartIcon.first().click({ force: true });
    }
      
    await this.page.waitForLoadState('domcontentloaded');
  }

  // ==================================================
// AI ASSISTANT
// CHECK AI PRODUCT DETAIL PAGE
// ==================================================

async hasAIProductAvailable() {

    console.log(
        'Checking AI recommended product page...'
    );

    // Wait for the new product page to render
    await this.page.waitForLoadState(
        'domcontentloaded'
    ).catch(() => {});

    await this.page.waitForTimeout(1500);

    console.log(
        `Current product page URL: ${this.page.url()}`
    );


    // --------------------------------------------------
    // VERIFY PRODUCT DETAIL PAGE
    // --------------------------------------------------

    if (!this.page.url().includes('/products/')) {

        console.log(
            'Current page is not an AI product-detail page.'
        );

        return false;
    }

    console.log(
        'AI product-detail page confirmed.'
    );


    // --------------------------------------------------
    // EXACT ADD TO CART BUTTON
    // --------------------------------------------------

    const addToCartButton =
        this.page.getByRole(
            'button',
            {
                name: 'Add to cart',
                exact: true
            }
        ).first();


    // --------------------------------------------------
    // WAIT FOR BUTTON
    // --------------------------------------------------

    const buttonVisible =
        await addToCartButton
            .isVisible({
                timeout: 15000
            })
            .catch(() => false);


    if (!buttonVisible) {

        console.log(
            'Add to cart button is not visible.'
        );

        return false;
    }


    console.log(
        'AI Add to cart button found.'
    );

    return true;
}


// ==================================================
// AI ASSISTANT
// ADD RECOMMENDED PRODUCT TO CART
// ==================================================

async addAIProductToCart() {

    console.log(
        'Adding AI recommended product to cart...'
    );


    // --------------------------------------------------
    // CHECK PRODUCT
    // --------------------------------------------------

    const productAvailable =
        await this.hasAIProductAvailable();


    if (!productAvailable) {

        throw new Error(
            'AI recommended product is not available on product page.'
        );
    }


    // --------------------------------------------------
    // GET FRESH LOCATOR
    // --------------------------------------------------

    const addToCartButton =
        this.page.getByRole(
            'button',
            {
                name: 'Add to cart',
                exact: true
            }
        ).first();


    // --------------------------------------------------
    // CLICK
    // --------------------------------------------------

    await addToCartButton.click({
        force: true,
        timeout: 15000
    });


    console.log(
        'AI recommended product added to cart.'
    );


    await this.page.waitForTimeout(1500);

    return true;
}


// ==================================================
// AI ASSISTANT
// NAVIGATE TO SHOPPING CART
// ==================================================

async navigateToAICart() {

    console.log(
        'Navigating from AI product page to shopping cart...'
    );


    // --------------------------------------------------
    // OPTION 1: SHOPPING CART BUTTON
    // --------------------------------------------------

    const cartButton =
        this.page.getByRole(
            'button',
            {
                name: /Shopping cart/i
            }
        ).first();


    const cartButtonVisible =
        await cartButton
            .isVisible({
                timeout: 5000
            })
            .catch(() => false);


    if (cartButtonVisible) {

        console.log(
            'Shopping cart button found.'
        );


        await cartButton.click({
            force: true
        });


        await this.waitAfterAction();


        console.log(
            'Shopping cart opened.'
        );


        return true;
    }


    // --------------------------------------------------
    // OPTION 2: SHOPPING CART LINK
    // --------------------------------------------------

    const cartLink =
        this.page.getByRole(
            'link',
            {
                name: /Shopping cart|Cart/i
            }
        ).first();


    const cartLinkVisible =
        await cartLink
            .isVisible({
                timeout: 5000
            })
            .catch(() => false);


    if (cartLinkVisible) {

        console.log(
            'Shopping cart link found.'
        );


        await cartLink.click({
            force: true
        });


        await this.waitAfterAction();


        console.log(
            'Shopping cart opened.'
        );


        return true;
    }


    // --------------------------------------------------
    // OPTION 3: GENERIC CART LOCATORS
    // --------------------------------------------------

    const cartCandidates = [

        this.page.locator(
            'a[href*="shoppingcart"]'
        ),

        this.page.locator(
            'a[href*="cart"]'
        ),

        this.page.locator(
            '[aria-label*="cart" i]'
        )

    ];


    for (const candidate of cartCandidates) {

        const visible =
            await candidate
                .first()
                .isVisible({
                    timeout: 3000
                })
                .catch(() => false);


        if (visible) {

            console.log(
                'Generic cart locator found.'
            );


            await candidate
                .first()
                .click({
                    force: true
                });


           await cartButton.click({
                    force: true
                });

                await this.page.waitForTimeout(1500);

                console.log(
                    'Shopping cart opened.'
                );
            return true;
        }
    }


    throw new Error(
        'Shopping cart could not be located from AI product page.'
    );
}

  // ==================================================
// INDIA AI ASSISTANT
// ADD PRODUCT TO CART
// ==================================================

async addAIProductToCart() {

    console.log(
        'Adding AI recommended product to cart...'
    );

    const productAvailable =
        await this.hasAIProductAvailable();

    if (!productAvailable) {

        throw new Error(
            'AI recommended product is not available on product page.'
        );
    }

    const addToCartButton =
        this.page.getByRole(
            'button',
            {
                name: 'Add to cart',
                exact: true
            }
        ).first();

    await addToCartButton.click({
        force: true,
        timeout: 15000
    });

    console.log(
        'AI recommended product added to cart.'
    );

    await this.page.waitForTimeout(1500);

    return true;
}


// ==================================================
// INDIA AI ASSISTANT
// NAVIGATE TO SHOPPING CART
// ==================================================

// ==================================================
// AI ASSISTANT
// NAVIGATE FROM PRODUCT PAGE TO CART
// ==================================================

async navigateToAICart() {

    console.log(
        'Navigating from AI product page to shopping cart...'
    );

    // ------------------------------------------
    // OPTION 1: SHOPPING CART BUTTON
    // ------------------------------------------

    const shoppingCartButton =
        this.page.getByRole(
            'button',
            {
                name: /Shopping cart/i
            }
        ).first();

    const shoppingCartButtonVisible =
        await shoppingCartButton
            .isVisible({
                timeout: 5000
            })
            .catch(() => false);

    if (shoppingCartButtonVisible) {

        console.log(
            'Shopping cart button found.'
        );

        await shoppingCartButton.click({
            force: true,
            timeout: 10000
        });

        await this.page.waitForTimeout(1500);

        console.log(
            'Shopping cart opened.'
        );

        console.log(
            `Current URL: ${this.page.url()}`
        );

        return true;
    }


    // ------------------------------------------
    // OPTION 2: SHOPPING CART LINK
    // ------------------------------------------

    const shoppingCartLink =
        this.page.getByRole(
            'link',
            {
                name: /Shopping cart|Cart/i
            }
        ).first();

    const shoppingCartLinkVisible =
        await shoppingCartLink
            .isVisible({
                timeout: 5000
            })
            .catch(() => false);

    if (shoppingCartLinkVisible) {

        console.log(
            'Shopping cart link found.'
        );

        await shoppingCartLink.click({
            force: true,
            timeout: 10000
        });

        await this.page.waitForTimeout(1500);

        console.log(
            'Shopping cart opened.'
        );

        console.log(
            `Current URL: ${this.page.url()}`
        );

        return true;
    }


    // ------------------------------------------
    // OPTION 3: GENERIC CART LOCATORS
    // ------------------------------------------

    const cartCandidates = [

        this.page.locator(
            'a[href*="shoppingcart"]'
        ).first(),

        this.page.locator(
            'a[href*="cart"]'
        ).first(),

        this.page.locator(
            '[aria-label*="cart" i]'
        ).first(),

        this.page.getByRole(
            'button',
            {
                name: /cart/i
            }
        ).first(),

        this.page.getByRole(
            'link',
            {
                name: /cart/i
            }
        ).first()
    ];


    for (const candidate of cartCandidates) {

        const visible =
            await candidate
                .isVisible({
                    timeout: 2000
                })
                .catch(() => false);

        if (!visible) {
            continue;
        }

        console.log(
            'Generic shopping cart locator found.'
        );

        await candidate.click({
            force: true,
            timeout: 10000
        });

        await this.page.waitForTimeout(1500);

        console.log(
            'Shopping cart opened.'
        );

        console.log(
            `Current URL: ${this.page.url()}`
        );

        return true;
    }


    // ------------------------------------------
    // FAILURE
    // ------------------------------------------

    console.log(
        'Shopping cart could not be located.'
    );

    throw new Error(
        'Unable to navigate from AI product page to shopping cart.'
    );
}
}

module.exports = { ProductPage };
