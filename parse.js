const parse = require('./index.js');
scenario = `{
  abc: <ref *1> {
    abc: 123,
    def: 'test',
    ghi: { jkl: 'test' },
    xyz: { zzz: 123, jj: 'test', abc: [Circular *1] }
  },
  def: <ref *2> {
    zzz: 123,
    jj: 'test',
    abc: <ref *1> {
      abc: 123,
      def: 'test',
      ghi: { jkl: 'test' },
      xyz: [Circular *2]
    }
  }
}
`;
console.log(scenario);
console.log(parse.repairJson(scenario));
