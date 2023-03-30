sap.ui.define(
  [
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/m/MessageToast"
  ],
  /**
   * @param {typeof sap.ui.core.mvc.Controller} Controller
   */
  function (Controller, JSONModel, MessageToast) {
    "use strict";

    return Controller.extend(
      "ordinemateriali.workflowuimoduleemanuele.controller.App",
      {
        onInit: function () {
          this._setSupplierModel().then(function(oData){
            var oComponent = this.getOwnerComponent();
            var oSuppplierModel = new JSONModel({
              "listSupplier": oData.value
            });
            oComponent.setModel(oSuppplierModel, "supplier");
          }.bind(this)).catch(function(oError){
            console.log(oError);
          });
          this._createViewModel();
        },

        _setSupplierModel: function () {
          return new Promise(function (resolve, reject) {

            var appId = this.getOwnerComponent().getManifestEntry("/sap.app/id");
            var appPath = appId.replaceAll(".", "/");
            var appModulePath = jQuery.sap.getModulePath(appPath);
            $.ajax({
              url: appModulePath + "/catalogo/catalog/Suppliers",
              method: "GET",
              async: false,
              contentType: "application/json",
              success: function (result) {
                resolve(result);
              },
              error: function (request, status, error) {
                reject(error);
              },
            });
            
          }.bind(this));
        },

        _setSupplierModelOdata: function () {
          return new Promise(function (resolve, reject) {
            var oComponent = this.getOwnerComponent();
            var oCatalogoModel = oComponent.getModel("catalogo");
            oCatalogoModel.read("/Suppliers", {
              success: function (oData) {
               var prova = oData;
               resolve(prova);
              }.bind(this),
              error: function (oError) {
                var prova = oError;
                reject(prova);
              }.bind(this)
            });
          }.bind(this));
        },

        _createViewModel: function () {
          var oView = this.getView();
          var oViewModel = new JSONModel({
            nameSupplier: "",
            taxCodeSupplier: "",
            codeSupplier: "",
            tellNumber: 0,
            addressSupplier: "",
            isPresent: "",
            nameMaterial: "",
            descriptionMaterial: "",
            codeMaterial: "",
            saleMaterial: 0,
            costMaterial: 0,
          });
          oView.setModel(oViewModel, "view");
        },

        onPressCreateSaveRequest: function () {
          sap.ui.core.BusyIndicator.show(0);
          var oView = this.getView();
          var oViewModel = oView.getModel("view");
          var oAdditionalData = {
            "nameSupplier": oViewModel.getProperty("/nameSupplier"),
            "taxCodeSupplier": oViewModel.getProperty("/taxCodeSupplier"),
            "codeSupplier": oViewModel.getProperty("/codeSupplier"),
            "tellNumber": oViewModel.getProperty("/tellNumber"),
            "addressSupplier": oViewModel.getProperty("/addressSupplier"),
            "isPresent": oViewModel.getProperty("/isPresent"),
            "nameMaterial": oViewModel.getProperty("/nameMaterial"),
            "descriptionMaterial": oViewModel.getProperty("/descriptionMaterial"),
            "codeMaterial": oViewModel.getProperty("/codeMaterial"),
            "saleMaterial": oViewModel.getProperty("/saleMaterial"),
            "costMaterial": oViewModel.getProperty("/costMaterial"),
          };
          this.startWorkflowInstance(oAdditionalData).then(function (oData) {
            sap.ui.core.BusyIndicator.hide();
            MessageToast.show("Chiamata in successo");
          }).catch(function (oError) {
            sap.ui.core.BusyIndicator.hide();
            MessageToast.show("Chiamata andata in errore");
          });

        },

        startWorkflowInstance: function (initialContext) {
          var definitionId = "approvalstepEmanuele";

          var data = {
            definitionId: definitionId,
            context: initialContext,
          };
          return new Promise(function (fnResolve, fnError) {
            $.ajax({
              url: this._getWorkflowRuntimeBaseURL() + "/workflow-instances",
              method: "POST",
              async: false,
              contentType: "application/json",
              headers: {
                "X-CSRF-Token": this._fetchToken(),
              },
              data: JSON.stringify(data),
              success: function (result, xhr, data) {
                fnResolve(data);
              },
              error: function (request, status, error) {
                fnError(error);
              },
            });
          }.bind(this));

        },

        _fetchToken: function () {
          var fetchedToken;

          jQuery.ajax({
            url: this._getWorkflowRuntimeBaseURL() + "/xsrf-token",
            method: "GET",
            async: false,
            headers: {
              "X-CSRF-Token": "Fetch",
            },
            success(result, xhr, data) {
              fetchedToken = data.getResponseHeader("X-CSRF-Token");
            },
          });
          return fetchedToken;
        },

        _getWorkflowRuntimeBaseURL: function () {
          var appId = this.getOwnerComponent().getManifestEntry("/sap.app/id");
          var appPath = appId.replaceAll(".", "/");
          var appModulePath = jQuery.sap.getModulePath(appPath);

          return appModulePath + "/bpmworkflowruntime/v1";
        },
      }
    );
  }
);
