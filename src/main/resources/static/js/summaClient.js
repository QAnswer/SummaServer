/*!
 * SUMMA Client JavaScript Library
 * http://people.aifb.kit.edu/ath/summaClient/
 *
 * Includes jQuery and jQueryUI
 * http://jquery.com/
 * http://jqueryui.com/
 *
 * Copyright 2015 Andreas Thalhammer
 * Released under the MIT license and GPL v3.
 * https://github.com/athalhammer/summaClient/blob/master/LICENSE
 *
 * Date: 2015-08-28
 */
function summa(uri, topK, language, fixedProperty, id, service) {
    //$("#" + id).after("<div id=" + id + "_loading><img src='css/images/712.GIF'></div>");
    //$("#" + id + "_loading").hide();
    $("#" + id).hide();
    $.ajaxSetup({
                    accepts : {
                        "json" : "application/ld+json, application/json, text/javascript"
                    },
                    contents : {
                        "ld+json" : "application/ld+json"
                    },
                    converters : {
                        "ld+json json" : jQuery.parseJSON
                    }
                });
    var url = service + "?entity=" + uri + "&topK=" + topK + "&maxHops=1";

    if (language != null) {
        url += "&language=" + language;
    }
    if (fixedProperty != null) {
        url += "&fixedProperty=" + fixedProperty;
    }
    console.log(url);
    $.ajax({
               dataType : "json",
               url : url,
               beforeSend : function() {
                   // show loading bar
                   $("#" + id + "_loading").show();
               },
               complete : function() {
                   // remove loading bar
                   $("#" + id + "_loading").remove();
               },
               success : function(data) {
                   function label(uri) {
                       for ( k = 0; k < keys.length; k++) {
                           if(data[keys[k]]["@id"] == uri){
                               var part1 = data[keys[k]];
                           }
                       }
                       if (part1 != null) {
                           return labels = part1["http://www.w3.org/2000/01/rdf-schema#label"][0]["@value"];
                       } else {
                           var strArry = uri.split("/");
                           strArry[strArry.length - 1] = strArry[strArry.length - 1].split("_").join(" ");;
                           return strArry[strArry.length - 1];
                       }
                   }
                   var print = {
                       "entity" : "",
                       "statements" : []
                   };

                   var keys = Object.keys(data);

                   for (j = 0; j < topK; j++) {
                       for ( i = 0; i < keys.length; i++) {
                           var types = data[keys[i]]["http://purl.org/voc/summa/statement"];
                           if (types != null) {
                               print["entity"] = data[keys[i]]["http://purl.org/voc/summa/entity"][0]["@id"];
                               for ( k = 0; k < keys.length; k++) {
                                   if (data[keys[i]]["http://purl.org/voc/summa/statement"].length > j) {
                                       if(data[keys[k]]["@id"] == data[keys[i]]["http://purl.org/voc/summa/statement"][j]["@id"]){
                                           var statement = {
                                               "subject" : "",
                                               "predicate" : "",
                                               "object" : ""
                                           };
                                           statement["subject"] = data[keys[k]]["http://www.w3.org/1999/02/22-rdf-syntax-ns#subject"][0]["@id"];
                                           statement["predicate"] = data[keys[k]]["http://www.w3.org/1999/02/22-rdf-syntax-ns#predicate"][0]["@id"];
                                           statement["object"] = data[keys[k]]["http://www.w3.org/1999/02/22-rdf-syntax-ns#object"][0]["@id"];
                                           print.statements.push(statement);
                                       }
                                   }
                               }
                           }
                       }
                   }

                   $("#" + id).append("<div style='float:right' id='" + id + "_close'>x</div><h2>" + label(print.entity) + "</h2><table></table>");
                   for ( i = 0; i < print.statements.length; i++) {
                       if (print.statements[i].subject == print.entity) {
                           $("#" + id).children("table").append("<tr><td>" + label(print.statements[i].predicate) + "&nbsp;&nbsp;&nbsp;&nbsp;</td><td>" + label(print.statements[i].object) + "</td></tr>");
                       } else if (print.statements[i].object == print.entity) {
                           $("#" + id).children("table").append("<tr><td>" + label(print.statements[i].predicate) + " of&nbsp;&nbsp;&nbsp;&nbsp;</td><td>"+ label(print.statements[i].subject) + "</td></tr>");
                       }
                   }
                   $("#" + id).append("<i style='font-size:10px'>_______<br>Summary by <a href='" + service.substring(0, service.lastIndexOf("/")) + "'>" + service.substring(0, service.lastIndexOf("/")) + "</a></i>");
                   $("#" + id).show();
                   $("#" + id + "_close").click(function() {
                       $("#" + id).remove();
                   });
                   $('.' + id + '.click').click(function() {
                       $("#" + id).empty();
                       $("#" + id).hide();
                       summa(this.id, topK, language, fixedProperty, id, service);
                   });
               }
           });
}

function qSUM(topK, lang, fixedproperty, service) {
    var clicked = false;
    $("[its-ta-ident-ref]").unbind("mouseover");
    $("[its-ta-ident-ref]").mouseover(function() {
        var letter = String.fromCharCode(65 + Math.floor(Math.random() * 26));
        var identifier = letter + Date.now();
        $("body").append("<div class='sum sum-popup' id='" + identifier + "'></div>");
        $("#" + identifier).position({
                                         my : "left top",
                                         at : "right",
                                         of : $(this),
                                         collision : "fit"
                                     });
        summa($(this).attr("its-ta-ident-ref"), topK, lang, fixedproperty, identifier, service);
    });
    $("[its-ta-ident-ref]").click(function() {
        clicked = true;
    });
    $("[its-ta-ident-ref]").mouseout(function() {
        if (!clicked) {
            $(".sum-popup").remove();
        } else {
            clicked = false;
        }
    });
}