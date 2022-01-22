const Basket = {
    onion: 1,
    ginger: 2,
    garlic: 3,
}
const getVegetableNum = async (veg) => Basket[veg];

const start = async () => {
    console.log('Start');
    const arr = ['onion', 'ginger', 'garlic'];
    for (let i = 0; i < arr.length; ++i){
        const veg = arr[i];
        const num = await getVegetableNum(veg);
        console.log(veg, num);
    }
    console.log('End');
}

start()