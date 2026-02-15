<?php
/**
 * Plugin Name: Shahin Fit Platform API
 * Description: مدیریت متمرکز دیتابیس و ارتباطات API برای اپلیکیشن شاهین فیت - هماهنگ با نقش‌های ویرایشگر و مشترک.
 * Version: 1.4.0
 * Author: Shahin Fit
 * Text Domain: shahin-fit
 */

if ( ! defined( 'ABSPATH' ) ) {
    exit; // جلوگیری از دسترسی مستقیم
}

class ShahinFit_API_Handler {

    public function __construct() {
        add_action( 'rest_api_init', array( $this, 'register_routes' ) );
    }

    public function register_routes() {
        register_rest_route( 'shahin-fit/v1', '/data', array(
            array(
                'methods'             => 'GET',
                'callback'            => array( $this, 'get_app_data' ),
                'permission_callback' => array( $this, 'check_user_auth' ),
            ),
            array(
                'methods'             => 'POST',
                'callback'            => array( $this, 'save_app_data' ),
                'permission_callback' => array( $this, 'check_trainer_auth' ),
            ),
        ) );
    }

    // بررسی ورود کاربر
    public function check_user_auth() {
        return is_user_logged_in();
    }

    // بررسی سطح دسترسی مربی (ادمین یا ادیتور)
    public function check_trainer_auth() {
        if ( ! is_user_logged_in() ) return false;
        return current_user_can('editor') || current_user_can('administrator');
    }

    public function get_app_data() {
        $current_user = wp_get_current_user();
        
        $role = 'STUDENT';
        if ( current_user_can('editor') || current_user_can('administrator') ) {
            $role = 'TRAINER';
        }

        // دریافت داده‌ها از دیتابیس وردپرس
        $requests  = get_option( 'shahin_fit_requests', array() );
        $programs  = get_option( 'shahin_fit_programs', array() );
        $exercises = get_option( 'shahin_fit_exercises', array() );

        // اطمینان از آرایه بودن داده‌ها
        if (!is_array($requests)) $requests = array();
        if (!is_array($programs)) $programs = array();
        if (!is_array($exercises)) $exercises = array();

        $user_id_str = 'S' . $current_user->ID;

        // اگر کاربر شاگرد است، فقط اطلاعات مربوط به خودش را ببیند
        if ( $role === 'STUDENT' ) {
            $requests = array_values( array_filter( $requests, function( $req ) use ( $user_id_str ) {
                return isset($req['studentId']) && $req['studentId'] === $user_id_str;
            } ) );
            
            $programs = array_values( array_filter( $programs, function( $prog ) use ( $user_id_str ) {
                return isset($prog['studentId']) && $prog['studentId'] === $user_id_str;
            } ) );
        }

        return new WP_REST_Response( array(
            'role'        => $role,
            'requests'    => $requests,
            'programs'    => $programs,
            'exercises'   => $exercises,
            'currentUser' => array(
                'id'    => $user_id_str,
                'name'  => $current_user->display_name,
                'email' => $current_user->user_email
            )
        ), 200 );
    }

    public function save_app_data( $request ) {
        $params = $request->get_json_params();
        
        if ( isset( $params['requests'] ) ) {
            update_option( 'shahin_fit_requests', $params['requests'] );
        }
        if ( isset( $params['programs'] ) ) {
            update_option( 'shahin_fit_programs', $params['programs'] );
        }
        if ( isset( $params['exercises'] ) ) {
            update_option( 'shahin_fit_exercises', $params['exercises'] );
        }

        return new WP_REST_Response( array( 
            'status'  => 'success',
            'message' => 'Data saved successfully'
        ), 200 );
    }
}

new ShahinFit_API_Handler();
