<?php if ( ! defined('BASEPATH')) exit('No direct script access allowed');


/**
 * Composer Framework
 */
class Routemaster_ft extends EE_Fieldtype
{
	var $info = array(
			"name"		=> "Routemaster",
			"version"	=> "0.1"
		);
	var $js;

	static $gmap_loaded = false;

	function __construct()
	{
		parent::__construct();

	}
	

	public function display_field($data)
	{
		$this->loadJs();
		return "<div class='routemaster_field'>
					<div class=\"map_canvas\" style=\"width: 100%; height: 100%\"></div>
					<textarea name='".$this->field_name."' class=\"map_state\">".$data."</textarea>
				</div>";
	}








	public function loadJs()
	{

		$this->EE->cp->add_to_head("<link href='".URL_THIRD_THEMES."routemaster/css/styles.css' rel='stylesheet' type='text/javascript'/>");

		//RequireJS
	
		if(!Routemaster_ft::$gmap_loaded){
			$this->EE->cp->add_to_head("<script src=\"http://maps.googleapis.com/maps/api/js?sensor=false\" type='text/javascript'></script>");
			$this->EE->requirejs->add("third_party/routemaster/javascript/bootstrap");
			Routemaster_ft::$gmap_loaded = true;
		}

	
	}
}