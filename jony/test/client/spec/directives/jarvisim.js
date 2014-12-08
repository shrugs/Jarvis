'use strict';

describe('Directive: JarviSIM', function () {

  // load the directive's module
  beforeEach(module('jonyApp'));

  var element,
    scope;

  beforeEach(inject(function ($rootScope) {
    scope = $rootScope.$new();
  }));

  it('should make hidden element visible', inject(function ($compile) {
    element = angular.element('<-jarvi-s-i-m></-jarvi-s-i-m>');
    element = $compile(element)(scope);
    expect(element.text()).toBe('this is the JarviSIM directive');
  }));
});
