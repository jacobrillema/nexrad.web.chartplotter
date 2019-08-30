module.exports = {
    createRange: function(start, finish, step) {
        var range = [];
        for(let i = start; i < finish; i+=step) {
            range.push(start + i*step);
        }

        return range;
    },

    multiplyRange: function(range, factor) {
        for(let i = 0; i < range.length; i++) {
            range[i] *= factor;
        }

        return range;
    },

    addRange: function(range, add) {
        for(let i = 0; i < range.length; i++) {
            range[i] += add;
        }

        return range;
    }
}