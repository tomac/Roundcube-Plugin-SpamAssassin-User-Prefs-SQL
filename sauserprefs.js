/**
 * SAUserPrefs plugin script
 */

rcube_webmail.prototype.sauserprefs_toggle_level_char = function(checkbox) {
	var level_char;

	if (level_char = rcube_find_object('rcmfd_spamlevelchar'))
		level_char.disabled = !checkbox.checked;
}

rcube_webmail.prototype.sauserprefs_toggle_bayes = function(checkbox) {
	var tickbox;
	var dropdown;

	if (tickbox = rcube_find_object('rcmfd_spambayesrules'))
		tickbox.disabled = !checkbox.checked;

	if (tickbox = rcube_find_object('rcmfd_spambayesautolearn'))
		tickbox.disabled = !checkbox.checked;

	if ((dropdown = rcube_find_object('rcmfd_bayesnonspam')) && (tickbox.checked || !checkbox.checked))
		dropdown.disabled = !checkbox.checked;

	if ((dropdown = rcube_find_object('rcmfd_bayesspam')) && (tickbox.checked || !checkbox.checked))
		dropdown.disabled = !checkbox.checked;
}

rcube_webmail.prototype.sauserprefs_toggle_bayes_auto = function(checkbox) {
	var dropdown;

	if (dropdown = rcube_find_object('rcmfd_bayesnonspam'))
		dropdown.disabled = !checkbox.checked;

	if (dropdown = rcube_find_object('rcmfd_bayesspam'))
		dropdown.disabled = !checkbox.checked;
}

rcube_webmail.prototype.sauserprefs_addressrule_import = function(address) {
	parent.rcmail.set_busy(false, null, rcmail.env.sauserprefs_whitelist);

	var adrTable = rcube_find_object('address-rules-table').tBodies[0];

	var actions = document.getElementsByName('_address_rule_act[]');
	var prefs = document.getElementsByName('_address_rule_field[]');
	var addresses = document.getElementsByName('_address_rule_value[]');
	var insHere;

	for (var i = 1; i < addresses.length; i++) {
		if (addresses[i].value == address && actions[i].value != "DELETE") {
			return false;
		}
		else if (addresses[i].value > address) {
			insHere = adrTable.rows[i + 1];
			break;
		}
	}

	var newNode = adrTable.rows[0].cloneNode(true);
	adrTable.rows[1].style.display = 'none';

	if (insHere)
		adrTable.insertBefore(newNode, insHere);
	else
		adrTable.appendChild(newNode);

	newNode.style.display = "";
	newNode.cells[0].className = "whitelist_from";
	newNode.cells[0].innerHTML = rcmail.gettext('whitelist_from','sauserprefs');
	newNode.cells[1].innerHTML = address;
	actions[newNode.rowIndex - 2].value = "INSERT";
	prefs[newNode.rowIndex - 2].value = "whitelist_from";
	addresses[newNode.rowIndex - 2].value = address;

	rcmail.env.address_rule_count++;
}

rcube_webmail.prototype.sauserprefs_help = function(sel) {
	var help = rcube_find_object(sel);
	help.style.display = (help.style.display == 'none' ? '' : 'none');
	return false;
}

$(document).ready(function() {
	if (window.rcmail) {
		if (document.getElementById('spam-langs-table')) {
			var spam_langs_table = new rcube_list_widget(document.getElementById('spam-langs-table'), {});
			spam_langs_table.init();
		}

		if (document.getElementById('address-rules-table')) {
			var address_rules_table = new rcube_list_widget(document.getElementById('address-rules-table'), {});
			address_rules_table.init();
		}

		rcmail.addEventListener('init', function(evt) {
			if (rcmail.env.action == 'plugin.sauserprefs.edit') {
				rcmail.register_command('plugin.sauserprefs.select_all_langs', function() {
					var langlist = document.getElementsByName('_spamlang[]');
					var obj;

					for (var i = 0; i < langlist.length; i++) {
						langlist[i].checked = true;
						obj = rcube_find_object('spam_lang_'+ i);
						obj.title = rcmail.gettext('enabled','sauserprefs');
						obj.className = 'enabled';
					}

					return false;
				}, true);

				rcmail.register_command('plugin.sauserprefs.select_invert_langs', function() {
					var langlist = document.getElementsByName('_spamlang[]');
					var obj;

					for (var i = 0; i < langlist.length; i++) {
						if (langlist[i].checked) {
							langlist[i].checked = false;
							obj = rcube_find_object('spam_lang_'+ i);
							obj.title = rcmail.gettext('disabled','sauserprefs');
							obj.className = 'disabled';
						}
						else {
							langlist[i].checked = true;
							obj = rcube_find_object('spam_lang_'+ i);
							obj.title = rcmail.gettext('enabled','sauserprefs');
							obj.className = 'enabled';
						}
					}

					return false;
				}, true);

				rcmail.register_command('plugin.sauserprefs.select_no_langs', function() {
					var langlist = document.getElementsByName('_spamlang[]');
					var obj;

					for (var i = 0; i < langlist.length; i++) {
						langlist[i].checked = false;
						obj = rcube_find_object('spam_lang_'+ i);
						obj.title = rcmail.gettext('disabled','sauserprefs');
						obj.className = 'disabled';
					}

					return false;
				}, true);

				rcmail.register_command('plugin.sauserprefs.message_lang', function(lang_code, obj) {
					var langlist = document.getElementsByName('_spamlang[]');
					var i = obj.parentNode.parentNode.rowIndex - 1;

					if (langlist[i].checked) {
						langlist[i].checked = false;
						obj.title = rcmail.gettext('disabled','sauserprefs');
						obj.className = 'disabled';
					}
					else {
						langlist[i].checked = true;
						obj.title = rcmail.gettext('enabled','sauserprefs');
						obj.className = 'enabled';
					}

					return false;
				}, true);

				rcmail.register_command('plugin.sauserprefs.addressrule_del', function(props, obj) {
					var adrTable = rcube_find_object('address-rules-table').tBodies[0];
					var rowidx = obj.parentNode.parentNode.rowIndex - 1;
					var fieldidx = rowidx - 1;

					if (!confirm(rcmail.gettext('spamaddressdelete','sauserprefs')))
						return false;

					if (document.getElementsByName('_address_rule_act[]')[fieldidx].value == "INSERT") {
						adrTable.deleteRow(rowidx);
					}
					else {
						adrTable.rows[rowidx].style.display = 'none';
						document.getElementsByName('_address_rule_act[]')[fieldidx].value = "DELETE";
					}

					rcmail.env.address_rule_count--;
					if (rcmail.env.address_rule_count < 1)
						adrTable.rows[1].style.display = '';

					return false;
				}, true);

				rcmail.register_command('plugin.sauserprefs.addressrule_add', function() {
					var adrTable = rcube_find_object('address-rules-table').tBodies[0];
					var input_spamaddressrule = rcube_find_object('_spamaddressrule');
					var selrule = input_spamaddressrule.selectedIndex;
					var input_spamaddress = rcube_find_object('_spamaddress');

					if (input_spamaddress.value.replace(/^\s+|\s+$/g, '') == '') {
						alert(rcmail.gettext('spamenteraddress','sauserprefs'));
						input_spamaddress.focus();
						return false;
					}
					else if (!rcube_check_email(input_spamaddress.value.replace(/^\s+/, '').replace(/[\s,;]+$/, ''), true)) {
						alert(rcmail.gettext('spamaddresserror','sauserprefs'));
						input_spamaddress.focus();
						return false;
					}
					else {
						var actions = document.getElementsByName('_address_rule_act[]');
						var prefs = document.getElementsByName('_address_rule_field[]');
						var addresses = document.getElementsByName('_address_rule_value[]');
						var insHere;

						for (var i = 1; i < addresses.length; i++) {
							if (addresses[i].value == input_spamaddress.value && actions[i].value != "DELETE") {
								alert(rcmail.gettext('spamaddressexists','sauserprefs'));
								input_spamaddress.focus();
								return false;
							}
							else if (addresses[i].value > input_spamaddress.value) {
								insHere = adrTable.rows[i + 1];
								break;
							}
						}

						var newNode = adrTable.rows[0].cloneNode(true);
						adrTable.rows[1].style.display = 'none';

						if (insHere)
							adrTable.insertBefore(newNode, insHere);
						else
							adrTable.appendChild(newNode);

						newNode.style.display = "";
						newNode.cells[0].className = input_spamaddressrule.options[selrule].value;
						newNode.cells[0].innerHTML = input_spamaddressrule.options[selrule].text;
						newNode.cells[1].innerHTML = input_spamaddress.value;
						actions[newNode.rowIndex - 2].value = "INSERT";
						prefs[newNode.rowIndex - 2].value = input_spamaddressrule.options[selrule].value;
						addresses[newNode.rowIndex - 2].value = input_spamaddress.value;

						input_spamaddressrule.selectedIndex = 0;
						input_spamaddress.value = '';

						rcmail.env.address_rule_count++;
					}
				}, true);

				rcmail.register_command('plugin.sauserprefs.whitelist_delete_all', function(props, obj) {
					var adrTable = rcube_find_object('address-rules-table').tBodies[0];

					if (!confirm(rcmail.gettext('spamaddressdeleteall','sauserprefs')))
						return false;

					for (var i = adrTable.rows.length - 1; i > 1; i--) {
						if (document.getElementsByName('_address_rule_act[]')[i-1].value == "INSERT") {
							adrTable.deleteRow(i);
							rcmail.env.address_rule_count--;
						}
						else if (document.getElementsByName('_address_rule_act[]')[i-1].value != "DELETE") {
							adrTable.rows[i].style.display = 'none';
							document.getElementsByName('_address_rule_act[]')[i-1].value = "DELETE";
							rcmail.env.address_rule_count--;
						}
					}

					adrTable.rows[1].style.display = '';
					return false;
				}, true);

				rcmail.register_command('plugin.sauserprefs.import_whitelist', function(props, obj) {
					rcmail.env.sauserprefs_whitelist = rcmail.set_busy(true, 'sauserprefs.importingaddresses');
					rcmail.http_request('plugin.sauserprefs.whitelist_import', '', rcmail.env.sauserprefs_whitelist);
					return false;
				}, true);

				rcmail.register_command('plugin.sauserprefs.purge_bayes', function(props, obj) {
					if (confirm(rcmail.gettext('purgebayesconfirm','sauserprefs'))) {
						var lock = rcmail.set_busy(true, 'sauserprefs.purgingbayes');
						rcmail.http_request('plugin.sauserprefs.purge_bayes', '', lock);
					}

					return false;
				}, true);

				rcmail.register_command('plugin.sauserprefs.save', function() { rcmail.gui_objects.editform.submit(); }, true);

				rcmail.register_command('plugin.sauserprefs.default', function() {
					if (confirm(rcmail.gettext('usedefaultconfirm','sauserprefs'))) {
						// Score
						if (rcube_find_object('rcmfd_spamthres'))
							rcube_find_object('rcmfd_spamthres').selectedIndex = 0;

						// Subject tag
						if (rcube_find_object('rcmfd_spamsubject'))
							rcube_find_object('rcmfd_spamsubject').value = rcmail.env.rewrite_header_Subject

						// Languages
						var langlist = document.getElementsByName('_spamlang[]');
						var obj;
						var dlangs = " " + rcmail.env.ok_languages + " ";

						for (var i = 0; i < langlist.length; i++) {
							langlist[i].checked = false;
							obj = rcube_find_object('spam_lang_' + i);
							obj.title = rcmail.gettext('disabled','sauserprefs');
							obj.className = 'disabled';

							if (dlangs.indexOf(" " + langlist[i].value + " ") > -1 || rcmail.env.ok_languages == "all") {
								langlist[i].checked = true;
								obj = rcube_find_object('spam_lang_' + i);
								obj.title = rcmail.gettext('enabled','sauserprefs');
								obj.className = 'enabled';
							}
						}

						// Tests
						if (rcube_find_object('rcmfd_spamuserazor1')) {
							if (rcmail.env.use_razor1 == '1')
								rcube_find_object('rcmfd_spamuserazor1').checked = true;
							else
								rcube_find_object('rcmfd_spamuserazor1').checked = false;
						}

						if (rcube_find_object('rcmfd_spamuserazor2')) {
							if (rcmail.env.use_razor2 == '1')
								rcube_find_object('rcmfd_spamuserazor2').checked = true;
							else
								rcube_find_object('rcmfd_spamuserazor2').checked = false;
						}

						if (rcube_find_object('rcmfd_spamusepyzor')) {
							if (rcmail.env.use_pyzor == '1')
								rcube_find_object('rcmfd_spamusepyzor').checked = true;
							else
								rcube_find_object('rcmfd_spamusepyzor').checked = false;
						}

						if (rcube_find_object('rcmfd_spamusedcc')) {
							if (rcmail.env.use_dcc == '1')
								rcube_find_object('rcmfd_spamusedcc').checked = true;
							else
								rcube_find_object('rcmfd_spamusedcc').checked = false;
						}

						if (rcube_find_object('rcmfd_spamskiprblchecks')) {
							if (rcmail.env.skip_rbl_checks == '0')
								rcube_find_object('rcmfd_spamskiprblchecks').checked = true;
							else
								rcube_find_object('rcmfd_spamskiprblchecks').checked = false;
						}

						// Bayes
						if (rcube_find_object('rcmfd_spamusebayes')) {
							if (rcmail.env.use_bayes == '1')
								rcube_find_object('rcmfd_spamusebayes').checked = true;
							else
								rcube_find_object('rcmfd_spamusebayes').checked = false;
						}

						if (rcube_find_object('rcmfd_spambayesautolearn')) {
							if (rcmail.env.bayes_auto_learn == '1')
								rcube_find_object('rcmfd_spambayesautolearn').checked = true;
							else
								rcube_find_object('rcmfd_spambayesautolearn').checked = false;
						}

						if (rcube_find_object('rcmfd_bayesnonspam'))
							rcube_find_object('rcmfd_bayesnonspam').selectedIndex = 0;

						if (rcube_find_object('rcmfd_bayesspam'))
							rcube_find_object('rcmfd_bayesspam').selectedIndex = 0;

						if (rcube_find_object('rcmfd_spambayesrules')) {
							if (rcmail.env.use_bayes_rules == '1')
								rcube_find_object('rcmfd_spambayesrules').checked = true;
							else
								rcube_find_object('rcmfd_spambayesrules').checked = false;
						}

						// Headers
						if (rcube_find_object('rcmfd_spamfoldheaders')) {
							if (rcmail.env.skip_rbl_checks == '1')
								rcube_find_object('rcmfd_spamfoldheaders').checked = true;
							else
								rcube_find_object('rcmfd_spamfoldheaders').checked = false;
						}

						if (rcube_find_object('rcmfd_spamlevelstars')) {
							if (rcmail.env.add_header_all_Level != '') {
								rcube_find_object('rcmfd_spamlevelstars').checked = true;
								rcube_find_object('rcmfd_spamlevelchar').value = rcmail.env.add_header_all_Level.substr(7, 1);
							}
							else {
								rcube_find_object('rcmfd_spamlevelstars').checked = false;
								rcube_find_object('rcmfd_spamlevelchar').value = "*";
							}
						}

						// Report
						if (rcube_find_object('rcmfd_spamreport_0')) {
							if (rcmail.env.report_safe == '0')
								rcube_find_object('rcmfd_spamreport_0').checked = true;
							else
								rcube_find_object('rcmfd_spamreport_0').checked = false;
						}

						if (rcube_find_object('rcmfd_spamreport_1')) {
							if (rcmail.env.report_safe == '1')
								rcube_find_object('rcmfd_spamreport_1').checked = true;
							else
								rcube_find_object('rcmfd_spamreport_1').checked = false;
						}

						if (rcube_find_object('rcmfd_spamreport_2')) {
							if (rcmail.env.report_safe == '2')
								rcube_find_object('rcmfd_spamreport_2').checked = true;
							else
								rcube_find_object('rcmfd_spamreport_2').checked = false;
						}

						// Delete whitelist
						if (rcube_find_object('address-rules-table')) {
							var adrTable = rcube_find_object('address-rules-table').tBodies[0];
							for (var i = adrTable.rows.length - 1; i > 1; i--) {
								if (document.getElementsByName('_address_rule_act[]')[i-1].value == "INSERT") {
									adrTable.deleteRow(i);
									rcmail.env.address_rule_count--;
								}
								else if (document.getElementsByName('_address_rule_act[]')[i-1].value != "DELETE") {
									adrTable.rows[i].style.display = 'none';
									document.getElementsByName('_address_rule_act[]')[i-1].value = "DELETE";
									rcmail.env.address_rule_count--;
								}
							}
							adrTable.rows[1].style.display = '';
						}
					}
				}, true);

				rcmail.enable_command('plugin.sauserprefs.save','plugin.sauserprefs.default', true);
			}
		});

		if (rcmail.env.action == 'plugin.sauserprefs') {
			rcmail.section_select = function(list) {
				var id = list.get_single_selection()

				if (id) {
					var add_url = '';
					var target = window;
					this.set_busy(true);

					if (this.env.contentframe && window.frames && window.frames[this.env.contentframe]) {
						add_url = '&_framed=1';
						target = window.frames[this.env.contentframe];
					}

					target.location.href = this.env.comm_path + '&_action=plugin.sauserprefs.edit&_section=' + id + add_url;
				}

				return true;
			}
		}
	}
});