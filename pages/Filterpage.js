const { BasePage } = require('./BasePage');

class FilterPage extends BasePage {

    constructor(page) {
        super(page);

        this.page = page;

        this.filterSectionContainer =
            '.mantine-Accordion-item';

        this.noProductsMessage = this.page.getByText(
            /no products found/i
        );
    }


 async selectProductCategory(categoryName) {

    console.log(`SELECTING PRODUCT CATEGORY: ${categoryName}`);

    const categoryLabels = {

        laptop: 'Laptops',
        laptops: 'Laptops',

        desktop: 'Desktops',
        desktops: 'Desktops',

        printer: 'Printers',
        printers: 'Printers',

        peripheral: 'Peripherals',
        peripherals: 'Peripherals'
    };


    const categoryKey = String(categoryName).trim().toLowerCase();

    const labelText = categoryLabels[categoryKey];


    if (!labelText) {

        throw new Error(
            `Unknown product category: ${categoryName}`
        );
    }

    console.log(`Selecting horizontal category: ${labelText}`);


    const categoryLink =
        this.page
            .locator('a.mantine-Anchor-root')
            .filter({
                hasText: new RegExp(
                    `^${labelText}$`,
                    'i')
            })
            .first();


    await categoryLink.waitFor({state: 'visible',timeout: 10000});

    await categoryLink.scrollIntoViewIfNeeded();

    console.log(`Found horizontal category: ${labelText}`);


    console.log(`Clicking horizontal category: ${labelText}`);

    await categoryLink.click();

    console.log(`${labelText} category selected`);

}

    async applyFilterSelection(
        sectionHeading,
        subOptionLabel
    ) {

        console.log(`Applying filter: ${sectionHeading} → ${subOptionLabel}`);

        const filterSection = this.page.locator(this.filterSectionContainer).filter({hasText: sectionHeading}).first();

        await filterSection.waitFor({state: 'visible',timeout: 10000});

        const sectionButton = filterSection.getByRole('button', {name: new RegExp(`^${sectionHeading}$`,'i')}).first();

        if (
            await sectionButton
                .isVisible({
                    timeout: 2000
                })
                .catch(() => false)
        ) {

            console.log(`Expanding filter section: ${sectionHeading}`);

            await sectionButton.click({force: true});

            await this.page.waitForTimeout(400);
        }

        const option = filterSection.getByText(subOptionLabel,{exact: true}).first();

        await option.waitFor({state: 'visible',timeout: 10000});

        console.log(`Clicking filter option: ${subOptionLabel}`);

        await option.click({force: true});

        console.log(
            `Selected: ${sectionHeading} → ${subOptionLabel}`
        );

        await this.page.waitForTimeout(1000);
    }


async applyFilters(filters) {

    console.log('APPLYING PRODUCT FILTERS');

    for (const [sectionHeading, option] of Object.entries(filters)) {

        if (
            option === null ||
            option === undefined ||
            option === ''
        ) {
            console.log(`Skipping empty filter: ${sectionHeading}`);

            continue;
        }

        if (
            String(option).trim().toLowerCase() === 'select all'
        ) {
            console.log(`Skipping Select All: ${sectionHeading}`);

            continue;
        }

        const categoryFilterNames = [
            'Category',
            'Categories',
            'Product Category'
        ];

        if (
            categoryFilterNames.some(
                name =>
                    name.toLowerCase() ===
                    sectionHeading.toLowerCase()
            )
        ) {
            console.log(`Skipping category filter: ${sectionHeading}`);

            continue;
        }

        await this.applyFilterSelection(sectionHeading, option);
    }

    console.log('ALL PRODUCT FILTERS APPLIED');
}

async isProductAvailable() {

    console.log('Checking product results on page...');

    const noProductsMessage =
        this.page.getByText(
            /no products found/i
        ).first();

    const noProductsFound =
        await noProductsMessage.isVisible({
            timeout: 3000
        }).catch(() => false);


    if (noProductsFound) {

        const messageText =
            await noProductsMessage
                .innerText()
                .catch(() => 'No products found');

        console.log('NO PRODUCTS AVAILABLE');
        console.log(`Message: ${messageText}`);

        return false;
    }

    console.log('Products are available.');

    return true;
}
}

module.exports = {
    FilterPage
};