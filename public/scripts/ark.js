angular.module("arkServerManagerApp", ["ngRoute", "ngResource", "ui.bootstrap", "arkServerManagerApp.server", "arkServerManagerApp.config"]), angular.module("arkServerManagerApp.config", []), angular.module("arkServerManagerApp.server", []), angular.module("arkServerManagerApp").config(["$routeProvider", "$httpProvider", function (e, r) {
  e.when("login", {
    templateUrl: "./partials/login.html",
    controller: "LoginController"
  }).when("manager", {
    templateUrl: "./partials/manager.html",
    controller: "ServerController"
  }).otherwise({
    redirectTo: "manager"
  }), r.interceptors.push("myHttpInterceptor")
}]), angular.module("arkServerManagerApp").factory("myHttpInterceptor", ["$q", "$location", function (e, r) {
  return {
    request: function (e) {
      return e.headers = e.headers || {}, localStorage.token && (e.headers.Authorization = "Bearer " + localStorage.token), e
    },
    responseError: function (o) {
      return (401 === o.status || 403 === o.status) && r.path("login"), e.reject(o)
    }
  }
}]), angular.module("arkServerManagerApp.config").controller("ConfigController", ["$scope", "$rootScope", "$uibModalInstance", "Config", function (e, r, o, n) {
  e.server = {}, e.user = {}, n.forKey("server").get({}, function (r) {
    r && (e.server = r)
  });
  var t = function () {
    return e.server.memoryTarget && e.server.arkServerPath && e.server.steamCmdPath && e.server.serverName && e.server.serverAdminPassword ? !0 : (e.error = "Please set all required fields indicated with a *.", !1)
  };
  e.save = function () {
    t() && (e.error = null, n.forKey("server").save(e.server, function () {
      e.user.username || e.user.newPassword ? n.forUser().save(e.user, function () {
        r.memoryTarget = e.server.memoryTarget, o.dismiss("cancel")
      }, function (r) {
        e.error = r.data.message
      }) : (r.memoryTarget = e.server.memoryTarget, o.dismiss("cancel"))
    }, function (r) {
      e.error = r.data.message
    }))
  }, e.close = function () {
    t() && o.dismiss("cancel")
  }
}]), angular.module("arkServerManagerApp.config").factory("Config", ["$resource", function (e) {
  var r = location.origin;
  return {
    forKey: function (o) {
      return e(r + "/config/:key", {
        key: o
      })
    },
    forUser: function () {
      return e(r + "/user")
    }
  }
}]), angular.module("arkServerManagerApp.server").controller("LoginController", ["$scope", "$location", "Server", function (e, r, o) {
  e.login = function () {
    o.login().save({
      username: e.username,
      password: e.password
    }, function (e) {
      localStorage.setItem("token", e.token), r.path("manager")
    }, function (r) {
      e.error = r.data.message
    })
  }, e.logout = function () {
    localStorage.removeItem("token"), r.path("login")
  }
}]), angular.module("arkServerManagerApp.server").controller("ServerController", ["$scope", "$rootScope", "$location", "$uibModal", "Config", function (e, r, o, n, t) {
  if (!localStorage.token) return o.path("login"), void 0;
  e.log = "Log: \n";
  var a = location.origin.replace(/^http/, "ws") + "?token=" + localStorage.token,
    l = new WebSocket(a);
  l.onerror = function (e) {
    console.log("wserror:" + e)
  }, l.onclose = function () {
    console.log("disconnected"), localStorage.removeItem("token"), o.path("login")
  }, l.onopen = function () {
    t.forKey("server").get({}, function (o) {
      Object.keys(o).length <= 2 ? e.openConfig() : r.memoryTarget = o.memoryTarget
    })
  }, l.onmessage = function (r) {
    var o = JSON.parse(r.data);
    "log" == o.event ? (e.log = e.log + o.data.log + "\n", e.$apply(), $("#log")[0] && $("#log").scrollTop($("#log")[0].scrollHeight)) : "serverStatus" == o.event && (e.memory = o.data.memory, e.$apply())
  }, e.startServer = function () {
    l.send(JSON.stringify({
      event: "start"
    }))
  }, e.updateServer = function () {
    l.send(JSON.stringify({
      event: "update"
    }))
  }, e.stopServer = function () {
    l.send(JSON.stringify({
      event: "stop"
    }))
  }, e.forceStopServer = function () {
    l.send(JSON.stringify({
      event: "forceStop"
    }))
  }, e.openConfig = function () {
    n.open({
      templateUrl: "./partials/config.html",
      controller: "ConfigController",
      backdrop: "static",
      keyboard: !1
    })
  }
}]), angular.module("arkServerManagerApp.server").factory("Server", ["$resource", function (e) {
  var r = location.origin;
  return {
    login: function () {
      return e(r + "/login")
    }
  }
}]);
//# sourceMappingURL=maps/ark.js.map
