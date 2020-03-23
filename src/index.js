/**
 * @license MIT
 * @author abcrun
 **/

!(function(root, factory){
  if(typeof define === 'function' && define.amd) define(['besom'], factory);//AMD
  else if(typeof module === 'object' && module.exports) module.exports = factory(require('besom'));//CommonJS
  else root.Besom = factory(Besom);
})(this, function(besom){
  return besom;
});
