const { expect } = require('@playwright/test');
const { BasePage } = require('./BasePage');


class FilterPage extends BasePage {

    constructor(page) {

        super(page);

        // =====================================================
        // FILTER LOCATORS
        // =====================================================

        this.filterSectionContainer =
            '.mantine-Accordion-item';

        this.filterControl =
            '.mantine-Accordion-control';

        this.filterPanel =
            '.mantine-Accordion-panel';
    }


    // =========================================================
    // GET FILTER SECTION
    // =========================================================

    getFilterSection(sectionHeading) {

        return this.page
            .locator(this.filterSectionContainer)
            .filter({
                has: this.page.getByText(
                    sectionHeading,
                    {
                        exact: true
                    }
                )
            })
            .first();
    }


    // =========================================================
    // GET FILTER CHECKBOX
    // =========================================================

    getFilterCheckbox(
        filterSection,
        subOptionLabel
    ) {

        return filterSection
            .getByRole(
                'checkbox',
                {
                    name: subOptionLabel,
                    exact: true
                }
            )
            .first();
    }


    // =========================================================
    // CHECK IF FILTER OPTION IS VISIBLE
    // =========================================================

    async isFilterOptionVisible(
        checkbox
    ) {

        try {

            return await checkbox.isVisible();

        } catch {

            return false;
        }
    }


    // =========================================================
    // EXPAND FILTER SECTION
    // =========================================================

    async expandFilterSection(
        filterSection,
        sectionHeading,
        checkbox
    ) {

        console.log(
            `Checking filter section: ${sectionHeading}`
        );


        // -----------------------------------------------------
        // If checkbox is already visible,
        // accordion is already expanded.
        // DO NOT click the accordion again.
        // -----------------------------------------------------

        const alreadyVisible =
            await this.isFilterOptionVisible(
                checkbox
            );


        if (alreadyVisible) {

            console.log(
                `Filter section "${sectionHeading}" is already expanded.`
            );

            return;
        }


        console.log(
            `Expanding filter section: ${sectionHeading}`
        );


        // -----------------------------------------------------
        // Find accordion control
        // -----------------------------------------------------

        let sectionButton =
            filterSection.locator(
                this.filterControl
            ).first();


        // -----------------------------------------------------
        // Fallback
        // -----------------------------------------------------

        if (
            await sectionButton.count() === 0
        ) {

            sectionButton =
                filterSection
                    .getByRole('button')
                    .first();
        }


        await sectionButton.waitFor({

            state: 'visible',

            timeout: 10000
        });


        await sectionButton
            .scrollIntoViewIfNeeded();


        // -----------------------------------------------------
        // Check aria-expanded if available
        // -----------------------------------------------------

        const expanded =
            await sectionButton
                .getAttribute(
                    'aria-expanded'
                );


        if (expanded === 'true') {

            console.log(
                `"${sectionHeading}" already reports aria-expanded=true.`
            );

        } else {

            await sectionButton.click();

            console.log(
                `"${sectionHeading}" accordion clicked.`
            );
        }


        // -----------------------------------------------------
        // Wait until option becomes available
        // -----------------------------------------------------

        await checkbox.waitFor({

            state: 'attached',

            timeout: 10000
        });


        await expect(
            checkbox,
            `${sectionHeading} should expose ${subOptionLabel}`
        ).toBeVisible({

            timeout: 10000
        });


        console.log(
            `Filter section expanded: ${sectionHeading}`
        );
    }


    // =========================================================
    // SCROLL FILTER OPTION INTO VIEW
    // =========================================================

    async scrollToFilterOption(
        checkbox,
        sectionHeading,
        subOptionLabel
    ) {

        console.log(
            `Locating option: ${sectionHeading} → ${subOptionLabel}`
        );


        // -----------------------------------------------------
        // Wait for checkbox in DOM
        // -----------------------------------------------------

        await checkbox.waitFor({

            state: 'attached',

            timeout: 10000
        });


        // -----------------------------------------------------
        // Scroll inside filter panel if necessary.
        //
        // This is important for filters such as Graphics Card
        // because the filter has its own internal scrollbar.
        // -----------------------------------------------------

        try {

            await checkbox
                .scrollIntoViewIfNeeded();

        } catch (error) {

            console.log(
                `Normal scroll failed for ${subOptionLabel}. Trying DOM scroll...`
            );


            await checkbox.evaluate(
                element => {

                    element.scrollIntoView({

                        block: 'center',

                        inline: 'nearest'
                    });
                }
            );
        }


        // -----------------------------------------------------
        // Wait for visible state
        // -----------------------------------------------------

        await expect(
            checkbox,
            `${sectionHeading} → ${subOptionLabel} should be visible`
        ).toBeVisible({

            timeout: 10000
        });


        console.log(
            `Option visible: ${subOptionLabel}`
        );
    }


    // =========================================================
// SELECT FILTER CHECKBOX
// =========================================================

async selectFilterCheckbox(
    checkbox,
    sectionHeading,
    subOptionLabel
) {

    console.log(
        `Checking current state: ${sectionHeading} → ${subOptionLabel}`
    );


    // =====================================================
    // CHECK CURRENT STATE
    // =====================================================

    const alreadyChecked =
        await checkbox.isChecked()
            .catch(() => false);


    if (alreadyChecked) {

        console.log(
            `${sectionHeading} → ${subOptionLabel} is already selected.`
        );

        return;
    }


    // =====================================================
    // SELECT FILTER
    // =====================================================

    console.log(
        `Selecting filter option: ${subOptionLabel}`
    );


    await checkbox.check({
        timeout: 10000
    });


    console.log(
        `Filter click completed: ${sectionHeading} → ${subOptionLabel}`
    );


    // =====================================================
    // IMPORTANT:
    // TechPay re-renders the filter DOM after selection.
    //
    // DO NOT assert against the old checkbox locator.
    // Wait for the UI to settle and then locate it again.
    // =====================================================

    await this.page.waitForTimeout(800);


    console.log(
        `Re-validating filter after catalogue refresh...`
    );


    // =====================================================
    // RE-FIND FILTER SECTION
    // =====================================================

    const refreshedSection =
        this.getFilterSection(
            sectionHeading
        );


    const sectionExists =
        await refreshedSection
            .count()
            .catch(() => 0);


    // =====================================================
    // SECTION MAY TEMPORARILY DISAPPEAR DURING REFRESH
    // =====================================================

    if (sectionExists === 0) {

        console.log(
            `Filter section temporarily refreshed after selecting ${subOptionLabel}.`
        );

        console.log(
            `Selection action completed: ${sectionHeading} → ${subOptionLabel}`
        );

        return;
    }


    // =====================================================
    // RE-FIND CHECKBOX FROM NEW DOM
    // =====================================================

    const refreshedCheckbox =
        this.getFilterCheckbox(
            refreshedSection,
            subOptionLabel
        );


    const checkboxExists =
        await refreshedCheckbox
            .count()
            .catch(() => 0);


    // =====================================================
    // OPTION CAN DISAPPEAR AFTER BEING APPLIED
    //
    // This is acceptable for dynamic catalogue filters.
    // =====================================================

    if (checkboxExists === 0) {

        console.log(
            `${subOptionLabel} disappeared from the filter list after selection.`
        );

        console.log(
            `This indicates the catalogue/filter DOM was refreshed.`
        );

        console.log(
            `Selection action completed: ${sectionHeading} → ${subOptionLabel}`
        );

        return;
    }


    // =====================================================
    // OPTION STILL EXISTS
    // VERIFY ITS NEW STATE
    // =====================================================

    const checkedAfterRefresh =
        await refreshedCheckbox
            .isChecked()
            .catch(() => false);


    if (checkedAfterRefresh) {

        console.log(
            `Verified selected: ${sectionHeading} → ${subOptionLabel}`
        );

        return;
    }


    // =====================================================
    // CHECK FOR VISUAL SELECTED STATE
    // =====================================================

    const label =
        refreshedSection
            .getByText(
                subOptionLabel,
                {
                    exact: true
                }
            )
            .first();


    const labelVisible =
        await label
            .isVisible()
            .catch(() => false);


    if (!labelVisible) {

        console.log(
            `${subOptionLabel} is no longer visible after catalogue refresh.`
        );

        console.log(
            `Selection action completed: ${sectionHeading} → ${subOptionLabel}`
        );

        return;
    }


    // =====================================================
    // IF THE SAME CHECKBOX STILL EXISTS AND IS UNCHECKED,
    // THEN THE SELECTION ACTUALLY FAILED
    // =====================================================

    throw new Error(
        `Filter selection failed: ` +
        `${sectionHeading} → ${subOptionLabel} ` +
        `is still available but not selected after refresh.`
    );
}


    // =========================================================
    // APPLY SINGLE FILTER
    // =========================================================

    async applyFilterSelection(
        sectionHeading,
        subOptionLabel
    ) {

        console.log(
            '\n========================================'
        );

        console.log(
            `Applying filter: ${sectionHeading} → ${subOptionLabel}`
        );

        console.log(
            '========================================'
        );


        // -----------------------------------------------------
        // Find filter section
        // -----------------------------------------------------

        const filterSection =
            this.getFilterSection(
                sectionHeading
            );


        await filterSection.waitFor({

            state: 'visible',

            timeout: 10000
        });


        console.log(
            `Filter section found: ${sectionHeading}`
        );


        // -----------------------------------------------------
        // Find checkbox
        // -----------------------------------------------------

        const checkbox =
            this.getFilterCheckbox(
                filterSection,
                subOptionLabel
            );


        // -----------------------------------------------------
        // Expand accordion only when necessary
        // -----------------------------------------------------

        await this.expandFilterSection(

            filterSection,

            sectionHeading,

            checkbox
        );


        // -----------------------------------------------------
        // IMPORTANT:
        // Website can re-render after accordion interaction.
        //
        // Get checkbox again so we don't use a stale locator
        // state.
        // -----------------------------------------------------

        const refreshedFilterSection =
            this.getFilterSection(
                sectionHeading
            );


        const refreshedCheckbox =
            this.getFilterCheckbox(

                refreshedFilterSection,

                subOptionLabel
            );


        // -----------------------------------------------------
        // Scroll option into view
        // -----------------------------------------------------

        await this.scrollToFilterOption(

            refreshedCheckbox,

            sectionHeading,

            subOptionLabel
        );


        // -----------------------------------------------------
        // Select checkbox
        // -----------------------------------------------------

        await this.selectFilterCheckbox(

            refreshedCheckbox,

            sectionHeading,

            subOptionLabel
        );


        // -----------------------------------------------------
        // Small stabilization wait for product refresh.
        //
        // We can replace this later with an API/product-grid
        // condition once we identify the relevant response.
        // -----------------------------------------------------

        // =========================================================
        // WAIT FOR TECHPAY CATALOGUE REFRESH
        // =========================================================

        console.log(
            'Waiting for catalogue to refresh after filter selection...'
        );

        await this.page.waitForLoadState(
            'domcontentloaded'
        ).catch(() => {});

        await this.page.waitForTimeout(
            1200
        );

        console.log(
            `Filter completed: ${sectionHeading} → ${subOptionLabel}`
        );
    }


    // =========================================================
    // APPLY ALL FILTERS
    // =========================================================

    async applyFilters(filters) {

        if (
            !filters ||
            Object.keys(filters).length === 0
        ) {

            console.log(
                'No filters configured.'
            );

            return;
        }


        console.log(
            '\n========================================'
        );

        console.log(
            'APPLYING PRODUCT FILTERS'
        );

        console.log(
            '========================================'
        );


        for (
            const [
                sectionHeading,
                subOptionLabel
            ]
            of Object.entries(filters)
        ) {

            await this.applyFilterSelection(

                sectionHeading,

                subOptionLabel
            );
        }


        console.log(
            '\n========================================'
        );

        console.log(
            'ALL PRODUCT FILTERS APPLIED'
        );

        console.log(
            '========================================\n'
        );
    }

    // ============================================================
// CHECK PRODUCT AVAILABILITY
// ============================================================

async isProductAvailable() {

    console.log(
        '========================================'
    );

    console.log(
        'CHECKING PRODUCT AVAILABILITY'
    );

    console.log(
        '========================================'
    );


    // --------------------------------------------------------
    // WAIT FOR CATALOGUE TO SETTLE
    // --------------------------------------------------------

    await this.page.waitForTimeout(1000);


    // --------------------------------------------------------
    // 1. CHECK EXPLICIT EMPTY-CATALOGUE MESSAGES
    //
    // Examples currently observed:
    //
    // "No products found for Gadgets Guru"
    // "No products match these filters."
    // --------------------------------------------------------

    const noProductsMessage = this.page
        .getByText(
            /no products found|no products match/i
        )
        .first();


    const noProductsVisible =
        await noProductsMessage
            .isVisible({
                timeout: 2000
            })
            .catch(() => false);


    if (noProductsVisible) {

        const message =
            await noProductsMessage
                .textContent()
                .catch(() => 'No products found');


        console.log(
            `Empty catalogue detected: ${message?.trim()}`
        );

        console.log(
            'Product available: false'
        );


        return false;
    }


    // --------------------------------------------------------
    // 2. CHECK PRODUCT COUNT TEXT
    //
    // TechPay currently displays:
    //
    // In Store (0)
    // All Products (0)
    //
    // If BOTH are zero, catalogue is empty.
    // --------------------------------------------------------

    const allProductsZero = this.page
        .getByText(
            /All Products\s*\(0\)/i
        )
        .first();


    const inStoreZero = this.page
        .getByText(
            /In Store\s*\(0\)/i
        )
        .first();


    const allProductsIsZero =
        await allProductsZero
            .isVisible()
            .catch(() => false);


    const inStoreIsZero =
        await inStoreZero
            .isVisible()
            .catch(() => false);


    if (
        allProductsIsZero &&
        inStoreIsZero
    ) {

        console.log(
            'Catalogue counters detected:'
        );

        console.log(
            'In Store (0)'
        );

        console.log(
            'All Products (0)'
        );

        console.log(
            'Product available: false'
        );


        return false;
    }


    // --------------------------------------------------------
    // 3. CHECK FOR ADD TO CART BUTTON
    //
    // This was already reliable in your Laptop/Desktop runs.
    // --------------------------------------------------------

    const addToCartButton = this.page
        .getByRole(
            'button',
            {
                name: /add to cart/i
            }
        )
        .first();


    const addToCartVisible =
        await addToCartButton
            .isVisible({
                timeout: 3000
            })
            .catch(() => false);


    if (addToCartVisible) {

        console.log(
            'Add to Cart button detected.'
        );

        console.log(
            'Product available: true'
        );


        return true;
    }


    // --------------------------------------------------------
    // 4. FALLBACK PRODUCT-CARD DETECTION
    // --------------------------------------------------------

    const productCards = this.page.locator(
        [
            '[class*="product-card"]',
            '[class*="ProductCard"]',
            '[data-testid*="product"]'
        ].join(',')
    );


    const productCount =
        await productCards.count();


    console.log(
        `Product cards detected: ${productCount}`
    );


    if (productCount > 0) {

        console.log(
            'Product card detected.'
        );

        console.log(
            'Product available: true'
        );


        return true;
    }


    // --------------------------------------------------------
    // 5. LAST FALLBACK
    //
    // Check if any visible Add to Cart text exists.
    // --------------------------------------------------------

    const addToCartText = this.page
        .getByText(
            /add to cart/i
        )
        .first();


    const addToCartTextVisible =
        await addToCartText
            .isVisible()
            .catch(() => false);


    if (addToCartTextVisible) {

        console.log(
            'Add to Cart text detected.'
        );

        console.log(
            'Product available: true'
        );


        return true;
    }


    // --------------------------------------------------------
    // NOTHING FOUND
    // --------------------------------------------------------

    console.log(
        'No product indicators detected.'
    );

    console.log(
        'Product available: false'
    );


    return false;
}
}


// =============================================================
// EXPORT
// =============================================================

module.exports = {
    FilterPage
};