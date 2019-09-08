module.exports = {
    createRange: function(start, finish, step) {
        var range = [];
        for(let i = start; i < finish; i+=step) {
            range.push(start + i*step);
        }

        return range;
    },

    multiplyRange: function(range, factor) {
        var newRange = new Array(range.length);

        for(let i = 0; i < range.length; i++) {
            newRange[i] = range[i] * factor;
        }

        return newRange;
    },

    addRange: function(range, add) {
        var newRange = new Array(range.length);

        for(let i = 0; i < range.length; i++) {
            newRange[i] = range[i] + add;
        }

        return newRange;
    }
}