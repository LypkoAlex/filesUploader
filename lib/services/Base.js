// import X from '../Exception';

module.exports =  class Base {
    async run(params) {
        return await this.execute(params);
    }
};
