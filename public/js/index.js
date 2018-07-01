
if (location.pathname === '/' || location.pathname === '/index' || location.pathname === 'index.html') {

    const baseAmount = document.querySelector('#base-currency-amt');
    const baseCurrency = document.querySelector('#base-currency');
    const quoteCurrency = document.querySelector('#quote-currency');
    const quoteAmount = document.querySelector('#quote-currency-amt');
    const convertButton = document.querySelector('#convert-button');

    function validator() {
        if (!baseCurrency.value) {
            M.toast({ html: 'Please select a base currency' });
            return false;
        } else if (!quoteCurrency.value) {
            M.toast({ html: 'Please select a quote currency' });
            return false;
        } else if (!baseAmount.value) {
            M.toast({ html: 'Please enter an amount to convert' });
            return false;
        }
        return true;
    }
    convertButton.addEventListener('click', () => {

        if (validator()) {
            let amount = baseAmount.value;
            let resultBox = quoteAmount;
            let url = `/api/convert?from=${baseCurrency.value}&to=${quoteCurrency.value}`;
            
            fetch(url).then(response => response.json())
            .then((data) => {
                var key = `${baseCurrency.value}_${quoteCurrency.value}`;
                var json = JSON.parse(JSON.stringify(data));
                var amount = json[key].val;
                //console.log(json[key].val);
                resultBox.disabled = false;
                resultBox.focus();
                resultBox.value = Number(amount * baseAmount.value).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,');
                resultBox.disabled=true;
            });
        }
    });

}
