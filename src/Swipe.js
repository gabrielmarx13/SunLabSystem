class Swipe {
    constructor (id, inOut, timestamp) {
        this.id = id;
        this.inOut = inOut;
        this.timestamp = timestamp;
    }
}

const swipeConverter = {
    toFirestore: (swipe) => {
        return {
            id: swipe.id,
            inOut: swipe.inOut,
            timestamp: swipe.timestamp
        };
    },

    fromFirestore: (snapshot, options) => {
        const data = snapshot.data(options);
        return new Swipe(data.id, data.inOut, data.timestamp)
    }
};

module.exports = {
    Swipe,
    swipeConverter
}
