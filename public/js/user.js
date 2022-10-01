$(document).ready(function() {
    $('.user-activate').on('change', function (e) {
        e.preventDefault();
        console.log($(this).is(':checked'));
        var self = $(this);
        if ($(this).is(':checked')) {
            $.ajax({
                url: "/edit/" + this.value,
                type: "PUT",
                data: {
                    active: '1',
                    activate: 'oui',
                    type: 'admin'
                },
                success: function (reponse) {
                    self.parent().find(".yesorno").html("Oui");
                },
                error: function (reponse) {
                    self.parent().find(".yesorno").html("Non");
                    swal(
                        "Erreur !",
                        "Une erreur est survenue, veuillez reessayer plutard.",
                        'error'
                    );
                    console.log('responserror' + reponse);
                }
            });
        } else {
            $.ajax({
                url: "/edit/" + this.value,
                type: "PUT",
                data: {
                    active: '0',
                    activate: 'oui',
                    type: 'admin'
                },
                success: function (reponse) {
                    self.parent().find(".yesorno").html("Non");
                },
                error: function (reponse) {
                    self.parent().find(".yesorno").html("Oui");
                    swal(
                        "Erreur !",
                        "Une erreur est survenue, veuillez reessayer plutard.",
                        'error'
                    );
                    console.log('responserror' + reponse);
                }
            });
        }

    });

    $('.usertype_selector').on('click', function () {
        if ($(this).attr('attr-val') == "ecole") {
            $('.eleve_selector').removeClass('active');
            $('.ecole_selector').addClass('active');
            $('.eleve_form').hide(100);
            $('.ecole_form').show(300);
        } else {
            $('.ecole_selector').removeClass('active');
            $('.eleve_selector').addClass('active');
            $('.ecole_form').hide(100);
            $('.eleve_form').show(300);
        }
    })

    $(document).on('click', '.testdeclose', function () {
        $(this).parent().remove();
    })


    $('.submit_all').on('click', function (e) {
        e.preventDefault();
        var texte_bouton = $(this).text();
        $(this).html("En cours...");
        if ($('.pwd_eleve').val() == $('.pwd_confirm_eleve').val()) {
            var $form = $('.eleveformulairesave');
            var formdata = (window.FormData) ? new FormData($form[0]) : null;
            var data = (formdata !== null) ? formdata : $form.serialize();
            var verifiephone = iti1.getSelectedCountryData().iso2 == undefined ? "" : iti1.getSelectedCountryData().iso2.toUpperCase;
            data.append('phone',iti1.getNumber()+"|"+verifiephone);
            data.append('savetype',$(this).attr('attr-type'));
            data.append('password',$('.pwd_eleve').val());
            data.append('type_req',"admin");
            data.append('type',"client");
            data.append("id_eleve", $('.id_eleve').val());
            
            var self = $(this);
            $.ajax({
                url: '/signup',
                type: 'POST',
                processData: false,
                contentType: false,
                data: data,
                success: function(data) {
                    self.html(texte_bouton);
                    window.location.href = "/dashboard/users";
                },
                error: function(error) {
                    self.html(texte_bouton);
                    console.log(error);
                }
            })
        }else{
            self.html(texte_bouton);
            swal(
                'Erreur !',
                'Les mots de passe ne sont pas identiques !',
                'error'
            );
        }
    })

    $('.submit_all_ecole').on('click', function (e) {
        e.preventDefault();
        var texte_bouton = $(this).text();
        var self = $(this);
        $(this).html("En cours...");
        if ($('.pwd_ecole').val() == $('.pwd_confirm_ecole').val()) {
            var $form = $('.ecoleformulairesave');
            var formdata = (window.FormData) ? new FormData($form[0]) : null;
            var data = (formdata !== null) ? formdata : $form.serialize();
            var verifiephone = iti2.getSelectedCountryData().iso2 == undefined ? "" : iti2.getSelectedCountryData().iso2.toUpperCase;
            data.append('phone',iti2.getNumber()+"|"+verifiephone);
            data.append('savetype',$(this).attr('attr-type'));
            data.append('approved',$(".approvation").is(':checked') ? 'on' : 'off');
            data.append('password',$('.pwd_ecole').val());
            data.append('type_req',"admin");
            data.append('type',"transporteur");
            data.append("id_eleve", $('.id_eleve').val());
            
            $.ajax({
                url: '/signup',
                type: 'POST',
                processData: false,
                contentType: false,
                data: data,
                success: function(data) {
                    self.html(texte_bouton);
                    swal(
                        ' ',
                        data.message,
                        data.type
                    );
                    window.location.href = "/dashboard/users";
                },
                error: function(error) {
                    swal(
                        'Erreur !',
                        'Une erreur est survenue, veuillez reessayer plutard !',
                        'error'
                    );
                    self.html(texte_bouton);
                    console.log(error);
                }
            })
        }else{
            self.html(texte_bouton);
            swal(
                'Erreur !',
                'Les mots de passe ne sont pas identiques !',
                'error'
            );
        }
    })
});
