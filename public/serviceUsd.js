

if(window.config.spec.includes('usd')){
  window.purechatApi = {
    l: [],
    t: [],
    on: function () { this.l.push(arguments); }
  };
  (function () {
    var done = false;
    var script = document.createElement('script');
    script.async = true;
    script.type = 'text/javascript';
    script.src = 'https://app.purechat.com/VisitorWidget/WidgetScript';
    document.getElementsByTagName('HEAD').item(0).appendChild(script);
    script.onreadystatechange = script.onload = function (e) {
      if (!done && (!this.readyState || this.readyState == 'loaded' || this.readyState == 'complete')) {
        var w = new PCWidget({ c: '2a087192-7a04-4ed7-abfd-5e86a1ce67ce', f: true });
        done = true;
      }
    };
  })();  
}
